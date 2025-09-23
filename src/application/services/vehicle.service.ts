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

import {
  VEHICLE_ASSIGNMENT_REPOSITORY,
  type IVehicleAssignmentRepository,
} from '../../domain/repositories/vehicle-assignment.repository';

import {
  ASSOCIATION_POLICY_REPOSITORY,
  type IAssociationPolicyRepository,
} from '../../domain/repositories/association-policy.repository';

@Injectable()
export class VehicleService {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: IVehicleRepository,
    @Inject(VEHICLE_ASSOC_REPOSITORY) private readonly vehAssoc: IVehicleAssociationRepository,
    @Inject(VEHICLE_ASSIGNMENT_REPOSITORY) private readonly vehAssign: IVehicleAssignmentRepository,
    @Inject(ASSOCIATION_POLICY_REPOSITORY) private readonly policyRepo: IAssociationPolicyRepository,
    private readonly prisma: PrismaService,
  ) { }

  // ===== date helpers (EAT aware) =====
  private pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }
  private ymdUTC(d: Date) { return d.toISOString().slice(0, 10); }
  private todayEatYmd(): string {
    const now = new Date();
    const eatMs = now.getTime() + 3 * 3600_000;
    const eat = new Date(eatMs);
    return `${eat.getUTCFullYear()}-${this.pad2(eat.getUTCMonth() + 1)}-${this.pad2(eat.getUTCDate())}`;
  }
  private dbDateEqualsTodayEAT(dbDate?: Date | null): boolean {
    if (!dbDate) return false;
    return this.ymdUTC(dbDate) === this.todayEatYmd();
  }
  private isOverdueEAT(activeUntil?: Date | null): boolean {
    if (!activeUntil) return true;
    const au = this.ymdUTC(activeUntil);
    return au < this.todayEatYmd();
  }

  // ===== policy helper =====
  private async computeTodaysInterest(input: { association_id: number; is_weekly: boolean }): Promise<number> {
    const p = await this.policyRepo.get(input.association_id);
    if (!p) return 0;
    const base = input.is_weekly ? p.weekly_fee : p.monthly_fee;
    const delta = base * p.daily_fine_percent;
    return Math.round((delta + Number.EPSILON) * 100) / 100;
  }

  private async getActiveDriverIdsForVehicle(ctx: UserContext, vehicleId: number): Promise<number[]> {
    const views = await this.vehAssign.search(ctx, { vehicle_id: vehicleId, active: true });
    const ids = views.map((v) => v.driver_id);
    return Array.from(new Set(ids));
  }

  /**
   * SUBTRACT once for overdue drivers when vehicle becomes non-active (MAINTENANCE/RETIRED).
   * Guard: overdue, last_accrual_date == today(EAT), last_accrual_amount > 0.
   * Effect: interest_accrued -= last_accrual_amount; last_accrual_amount = 0.
   */
  private async subtractTodaysInterestForOverdueDriversOnce(driverIds: number[]): Promise<void> {
    if (!driverIds.length) return;

    const rows = await this.prisma.driver.findMany({
      where: { id: { in: driverIds } },
      select: {
        id: true,
        association_id: true,
        is_weekly: true,
        active_until_date: true,
        interest_accrued: true,
        last_accrual_date: true,
        last_accrual_amount: true,
      },
    });

    for (const d of rows) {
      const overdue = this.isOverdueEAT(d.active_until_date ?? null);
      if (!overdue) continue;

      const sameLocalDay = this.dbDateEqualsTodayEAT(d.last_accrual_date ?? null);
      if (!sameLocalDay) continue;

      const lastAmt = Number(d.last_accrual_amount ?? 0);
      if (!(lastAmt > 0)) continue;

      const curr = Number(d.interest_accrued ?? 0);
      const newInterest = Math.max(0, curr - lastAmt);

      await this.prisma.driver.update({
        where: { id: d.id },
        data: {
          interest_accrued: newInterest,
          last_accrual_amount: 0, // guard
        },
      });
    }
  }

  /**
   * RE-ADD once for overdue drivers when vehicle becomes ACTIVE.
   * Guard: overdue, last_accrual_date == today(EAT), last_accrual_amount == 0.
   * Effect: interest_accrued += delta; last_accrual_amount = delta.
   */
  private async reAddTodaysInterestForOverdueDriversOnce(driverIds: number[]): Promise<void> {
    if (!driverIds.length) return;

    const rows = await this.prisma.driver.findMany({
      where: { id: { in: driverIds } },
      select: {
        id: true,
        association_id: true,
        is_weekly: true,
        active_until_date: true,
        interest_accrued: true,
        last_accrual_date: true,
        last_accrual_amount: true,
      },
    });

    for (const d of rows) {
      const overdue = this.isOverdueEAT(d.active_until_date ?? null);
      if (!overdue) continue;

      const sameLocalDay = this.dbDateEqualsTodayEAT(d.last_accrual_date ?? null);
      if (!sameLocalDay) continue;

      const lastAmt = Number(d.last_accrual_amount ?? 0);
      if (lastAmt !== 0) continue; // already posted today

      const delta = await this.computeTodaysInterest({
        association_id: d.association_id,
        is_weekly: Boolean(d.is_weekly),
      });
      if (delta <= 0) continue;

      const curr = Number(d.interest_accrued ?? 0);
      await this.prisma.driver.update({
        where: { id: d.id },
        data: {
          interest_accrued: curr + delta,
          last_accrual_amount: delta, // mark as posted
        },
      });
    }
  }

  // ===== public API =====

  async create(ctx: UserContext, dto: CreateVehicleDto) {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create vehicles');
    if (!ctx.association_id) throw new BadRequestException('association_id is required');

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

      await this.vehAssoc.create({
        vehicle_id: vehicle.id,
        association_id: vehicle.association_id,
        status: 'ACTIVE',
        started_at: new Date(),
      });

      return vehicle;
    });
  }

  findAll(ctx: UserContext, filter: VehicleFilter & { association_id?: number }) {
    return this.vehicles.findAll(ctx, filter);
  }


  async findOne(ctx: UserContext, id: number) {
    const v = await this.vehicles.findById(ctx, id);
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  async findActiveWithoutDriver(ctx: UserContext) {
    return this.vehicles.findActiveWithoutDriver(ctx);
  }


  async update(ctx: UserContext, id: number, dto: UpdateVehicleDto) {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot update vehicles');

    const existing = await this.vehicles.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    const now = new Date();

    // 1) Update base vehicle fields
    const updated = await this.vehicles.update(ctx, id, {
      plate_number: dto.plate_number,   // <-- add this line
      libre_no: dto.libre_no,
      owner_id: dto.owner_id,
      make: dto.make,
      model: dto.model,
      color: dto.color,
      capacity: dto.capacity,
      status: dto.vehicle_status, // ACTIVE | MAINTENANCE | RETIRED
    });

    // Interest effects based on vehicle status transition
    if (dto.vehicle_status && existing.status !== dto.vehicle_status) {
      const activeDriverIds: number[] = await this.getActiveDriverIdsForVehicle(ctx, updated.id);

      if (dto.vehicle_status === VehicleStatus.MAINTENANCE || dto.vehicle_status === VehicleStatus.RETIRED) {
        await this.subtractTodaysInterestForOverdueDriversOnce(activeDriverIds);
      } else if (dto.vehicle_status === VehicleStatus.ACTIVE) {
        await this.reAddTodaysInterestForOverdueDriversOnce(activeDriverIds);
      }
    }

    // Close active driver–vehicle assignments if vehicle RETIRED
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

    // 2) Association history (optional)
    if (dto.association_status) {
      const currentActive = await this.vehAssoc.findCurrentActive(updated.id);

      if (dto.association_status === 'ACTIVE') {
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
        if (currentActive) {
          await this.vehAssoc.closeActiveForVehicle(updated.id, dto.association_status, now);
        }
      }
    }

    return updated;
  }
}
