// src/application/services/vehicle.service.ts
import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import type { IVehicleAssociationRepository } from '../../domain/repositories/vehicle-association.repository';
import { VEHICLE_REPOSITORY, VehicleFilter } from '../../domain/repositories/vehicle.repository';
import { VEHICLE_ASSOC_REPOSITORY } from '../../domain/repositories/vehicle-association.repository';
import { CreateVehicleDto } from '../../presentation/vehicle/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../../presentation/vehicle/dto/update-vehicle.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { VehicleAssociationStatus, VehicleStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

// 👇 repos for active pair lookups (repository pattern)
import {
  VEHICLE_ASSIGNMENT_REPOSITORY,
  type IVehicleAssignmentRepository,
} from '../../domain/repositories/vehicle-assignment.repository';

@Injectable()
export class VehicleService {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: IVehicleRepository,
    @Inject(VEHICLE_ASSOC_REPOSITORY) private readonly vehAssoc: IVehicleAssociationRepository,
    @Inject(VEHICLE_ASSIGNMENT_REPOSITORY) private readonly vehAssign: IVehicleAssignmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ===== date helpers =====
  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  private isSameDay(a?: Date | null, b?: Date | null): boolean {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // ===== interest helpers (schema-agnostic, safe) =====
  /**
   * Compute today's interest for a driver using association config if available.
   * - Tries to read: weekly_fee, monthly_fee, fine_interest_percent_daily
   * - If not present, treated as 0 (no-op).
   */
  private async computeTodaysInterest(input: {
    id: number;
    association_id: number;
    is_weekly: boolean;
  }): Promise<number> {
    let weeklyFee = 0;
    let monthlyFee = 0;
    let dailyRate = 0;

    // Use raw SQL to avoid TS errors if columns don't exist yet.
    try {
      const rows = await this.prisma.$queryRawUnsafe<
        Array<{ weekly_fee?: unknown; monthly_fee?: unknown; fine_interest_percent_daily?: unknown }>
      >(
        `SELECT weekly_fee, monthly_fee, fine_interest_percent_daily
         FROM associations WHERE id = $1 LIMIT 1`,
        input.association_id,
      );
      if (rows && rows[0]) {
        weeklyFee = Number(rows[0].weekly_fee ?? 0) || 0;
        monthlyFee = Number(rows[0].monthly_fee ?? 0) || 0;
        dailyRate = Number(rows[0].fine_interest_percent_daily ?? 0) || 0;
      }
    } catch {
      // Treat as zeros if schema doesn't have these columns.
    }

    const base = input.is_weekly ? weeklyFee : monthlyFee;
    const interest = base * dailyRate;
    // round to 2dp
    return Math.round((interest + Number.EPSILON) * 100) / 100;
  }

  /**
   * Get all driver IDs currently "active-paired" to this vehicle (repository pattern).
   */
  private async getActiveDriverIdsForVehicle(ctx: UserContext, vehicleId: number): Promise<number[]> {
    const views = await this.vehAssign.search(ctx, { vehicle_id: vehicleId, active: true });
    const ids = views.map((v) => v.driver_id);
    return Array.from(new Set(ids));
  }

  /**
   * Subtract today's interest once for overdue drivers (only if it was already added today).
   * Safe if last_interest_accrual_date is missing: we skip the "already added?" check gracefully.
   */
  private async subtractTodaysInterestForOverdueDriversOnce(driverIds: number[]): Promise<void> {
    if (!driverIds.length) return;

    const today = this.startOfDay(new Date());

    // Strongly type the projection by casting through `unknown` → avoids TS 2352
    type DriverRow = {
      id: number;
      association_id: number;
      is_weekly: boolean;
      active_until_date: Date | null;
      interest_accrued: number;
      // may not exist yet; if absent it will be undefined at runtime
      last_interest_accrual_date?: Date | string | null;
    };

    const rows = (await this.prisma.driver.findMany({
      where: { id: { in: driverIds } },
      select: {
        id: true,
        association_id: true,
        is_weekly: true,
        active_until_date: true,
        interest_accrued: true,
        // DO NOT include last_interest_accrual_date in select to keep schema-agnostic typing;
        // we’ll read it dynamically if present.
      } as const,
    })) as unknown as DriverRow[];

    for (const d of rows) {
      const activeUntil = d.active_until_date ? this.startOfDay(new Date(d.active_until_date)) : null;

      // Must be overdue
      if (!activeUntil || activeUntil >= today) continue;

      // Only subtract if "today's interest" was already added
      const lastAccrual = d.last_interest_accrual_date
        ? new Date(d.last_interest_accrual_date)
        : undefined;
      if (lastAccrual && !this.isSameDay(lastAccrual, today)) continue;

      const delta = await this.computeTodaysInterest({
        id: d.id,
        association_id: d.association_id,
        is_weekly: Boolean(d.is_weekly),
      });
      if (delta <= 0) continue;

      await this.prisma.driver.update({
        where: { id: d.id },
        data: { interest_accrued: { decrement: delta } },
      });
    }
  }

  /**
   * Re-add today's interest once for still-overdue drivers (same-day optional rule).
   * Safe if last_interest_accrual_date is missing: we only re-add when marker equals today (if present).
   */
  private async reAddTodaysInterestForOverdueDriversOnce(driverIds: number[]): Promise<void> {
    if (!driverIds.length) return;

    const today = this.startOfDay(new Date());

    type DriverRow = {
      id: number;
      association_id: number;
      is_weekly: boolean;
      active_until_date: Date | null;
      last_interest_accrual_date?: Date | string | null;
    };

    const rows = (await this.prisma.driver.findMany({
      where: { id: { in: driverIds } },
      select: {
        id: true,
        association_id: true,
        is_weekly: true,
        active_until_date: true,
      } as const,
    })) as unknown as DriverRow[];

    for (const d of rows) {
      const activeUntil = d.active_until_date ? this.startOfDay(new Date(d.active_until_date)) : null;

      // Must still be overdue
      if (!activeUntil || activeUntil >= today) continue;

      // Only re-add "once" on the same day (if marker exists and is today)
      const lastAccrual = d.last_interest_accrual_date
        ? new Date(d.last_interest_accrual_date)
        : undefined;
      if (lastAccrual && !this.isSameDay(lastAccrual, today)) continue;

      const delta = await this.computeTodaysInterest({
        id: d.id,
        association_id: d.association_id,
        is_weekly: Boolean(d.is_weekly),
      });
      if (delta <= 0) continue;

      await this.prisma.driver.update({
        where: { id: d.id },
        data: { interest_accrued: { increment: delta } },
      });
    }
  }

  // ===== public API =====

  async create(ctx: UserContext, dto: CreateVehicleDto) {
    // Only Association users may create
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create vehicles');
    if (!ctx.association_id) throw new BadRequestException('association_id is required');

    // Create Vehicle + initial VehicleAssociation in a txn
    return this.prisma.$transaction(async () => {
      const vehicle = await this.vehicles.create(ctx, {
        plate_number: dto.plate_number,
        libre_no: dto.libre_no ?? null,
        owner_id: dto.owner_id,
        association_id: ctx.association_id!,
        make: dto.make ?? null,
        model: dto.model ?? null,
        color: dto.color ?? null,
        capacity: dto.capacity ?? null,
      });

      // Open first ACTIVE association record
      await this.vehAssoc.create({
        vehicle_id: vehicle.id,
        association_id: vehicle.association_id,
        status: 'ACTIVE',
        started_at: new Date(),
      });

      return vehicle;
    });
  }

  findAll(ctx: UserContext, filter: VehicleFilter) {
    return this.vehicles.findAll(ctx, filter);
  }

  async findOne(ctx: UserContext, id: number) {
    const v = await this.vehicles.findById(ctx, id);
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  async update(ctx: UserContext, id: number, dto: UpdateVehicleDto) {
    // Only Association users may update
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot update vehicles');

    const existing = await this.vehicles.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    const now = new Date();

    // 1) Update VEHICLE row fields (vehicle_status is optional)
    const updated = await this.vehicles.update(ctx, id, {
      libre_no: dto.libre_no,
      owner_id: dto.owner_id,
      make: dto.make,
      model: dto.model,
      color: dto.color,
      capacity: dto.capacity,
      status: dto.vehicle_status, // ACTIVE | MAINTENANCE | RETIRED
    });

    // === interest effects based on status transition ===
    if (dto.vehicle_status && existing.status !== dto.vehicle_status) {
      const activeDriverIds: number[] = await this.getActiveDriverIdsForVehicle(ctx, updated.id);

      if (dto.vehicle_status === VehicleStatus.MAINTENANCE || dto.vehicle_status === VehicleStatus.RETIRED) {
        // Vehicle becomes a non-payable source ⇒ subtract today's interest once (if already added)
        await this.subtractTodaysInterestForOverdueDriversOnce(activeDriverIds);
      } else if (dto.vehicle_status === VehicleStatus.ACTIVE) {
        // Vehicle becomes payable again ⇒ optionally re-add today's interest once (same-day rule)
        await this.reAddTodaysInterestForOverdueDriversOnce(activeDriverIds);
      }
    }

    // 1.a) If status transitioned to RETIRED ⇒ close the active driver–vehicle assignment for this vehicle (after interest adjust)
    if (
      dto.vehicle_status &&
      existing.status !== dto.vehicle_status &&
      dto.vehicle_status === VehicleStatus.RETIRED
    ) {
      await this.prisma.vehicleAssignment.updateMany({
        where: { vehicle_id: updated.id, active: true },
        data: { active: false, ended_at: now },
      });
    }

    // 2) Update ASSOCIATION history if requested (association_status is optional)
    if (dto.association_status) {
      const currentActive = await this.vehAssoc.findCurrentActive(updated.id);

      if (dto.association_status === 'ACTIVE') {
        // If there is no active association row, open a new one
        if (!currentActive) {
          await this.vehAssoc.create({
            association_id: updated.association_id,
            vehicle_id: updated.id,
            status: 'ACTIVE',
            started_at: now,
          });
        }
      } else if (
        dto.association_status === VehicleAssociationStatus.SUSPENDED ||
        dto.association_status === VehicleAssociationStatus.RESIGNED
      ) {
        // If there is an active association row, close it with the final status
        if (currentActive) {
          await this.vehAssoc.closeActiveForVehicle(updated.id, dto.association_status, now);
        }
      }
      // (No-op for anything else)
    }

    return updated;
  }
}
