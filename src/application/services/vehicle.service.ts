import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VEHICLE_REPOSITORY, VehicleFilter } from '../../domain/repositories/vehicle.repository';
import { CreateVehicleDto } from '../../presentation/vehicle/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../../presentation/vehicle/dto/update-vehicle.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { VehicleStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

import {
  ASSOCIATION_POLICY_REPOSITORY,
  type IAssociationPolicyRepository,
} from '../../domain/repositories/association-policy.repository';

@Injectable()
export class VehicleService {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: IVehicleRepository,
    @Inject(ASSOCIATION_POLICY_REPOSITORY) private readonly policyRepo: IAssociationPolicyRepository,
    private readonly prisma: PrismaService,
  ) { }

  // ===== date helpers (EAT aware) =====
  private pad2(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }
  private ymdUTC(d: Date) {
    return d.toISOString().slice(0, 10);
  }
  private todayEatYmd(): string {
    const now = new Date();
    const eatMs = now.getTime() + 3 * 3600_000;
    const eat = new Date(eatMs);
    return `${eat.getUTCFullYear()}-${this.pad2(eat.getUTCMonth() + 1)}-${this.pad2(
      eat.getUTCDate(),
    )}`;
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
  private async computeTodaysInterest(input: {
    association_id: number;
    is_weekly: boolean;
  }): Promise<number> {
    const p = await this.policyRepo.get(input.association_id);
    if (!p) return 0;
    const base = input.is_weekly ? p.weekly_fee : p.monthly_fee;
    const delta = base * p.daily_fine_percent;
    return Math.round((delta + Number.EPSILON) * 100) / 100;
  }

  /**
   * SUBTRACT once for overdue driver when vehicle becomes non-active (INACTIVE/MAINTENANCE).
   */
  private async subtractTodaysInterestForOverdueDriver(driverId: number | null): Promise<void> {
    if (!driverId) return;

    const d = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: {
        id: true,
        association_id: true,
        active_until_date: true,
        interest_accrued: true,
        last_accrual_date: true,
        last_accrual_amount: true,
        vehicle: { select: { is_weekly: true } }, // ✅ vehicle join
      },
    });

    if (!d) return;
    const overdue = this.isOverdueEAT(d.active_until_date ?? null);
    if (!overdue) return;

    const sameLocalDay = this.dbDateEqualsTodayEAT(d.last_accrual_date ?? null);
    if (!sameLocalDay) return;

    const lastAmt = Number(d.last_accrual_amount ?? 0);
    if (!(lastAmt > 0)) return;

    const curr = Number(d.interest_accrued ?? 0);
    const newInterest = Math.max(0, curr - lastAmt);

    await this.prisma.driver.update({
      where: { id: d.id },
      data: {
        interest_accrued: newInterest,
        last_accrual_amount: 0,
      },
    });
  }

  /**
   * RE-ADD once for overdue driver when vehicle becomes ACTIVE.
   */
  private async reAddTodaysInterestForOverdueDriver(driverId: number | null): Promise<void> {
    if (!driverId) return;

    const d = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: {
        id: true,
        association_id: true,
        active_until_date: true,
        interest_accrued: true,
        last_accrual_date: true,
        last_accrual_amount: true,
        vehicle: { select: { is_weekly: true } }, // ✅ vehicle join
      },
    });

    if (!d) return;
    const overdue = this.isOverdueEAT(d.active_until_date ?? null);
    if (!overdue) return;

    const sameLocalDay = this.dbDateEqualsTodayEAT(d.last_accrual_date ?? null);
    if (!sameLocalDay) return;

    const lastAmt = Number(d.last_accrual_amount ?? 0);
    if (lastAmt !== 0) return; // already posted today

    const delta = await this.computeTodaysInterest({
      association_id: d.association_id,
      is_weekly: Boolean(d.vehicle?.is_weekly),
    });
    if (delta <= 0) return;

    const curr = Number(d.interest_accrued ?? 0);
    await this.prisma.driver.update({
      where: { id: d.id },
      data: {
        interest_accrued: curr + delta,
        last_accrual_amount: delta,
      },
    });
  }

  // ===== public API =====

  async create(ctx: UserContext, dto: CreateVehicleDto) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot create vehicles');
    }
    if (!ctx.association_id) {
      throw new BadRequestException('association_id is required');
    }

    return this.vehicles.create(ctx, {
      plate_number: dto.plate_number,
      libre_no: dto.libre_no ?? null,
      owner_id: dto.owner_id,
      association_id: ctx.association_id!,
      driver_id: dto.driver_id ?? null,
      make: dto.make ?? null,
      model: dto.model ?? null,
      color: dto.color ?? null,
      capacity: dto.capacity ?? null,
      is_weekly: dto.is_weekly ?? false, // ✅ now stored on Vehicle
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
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot update vehicles');
    }

    const existing = await this.vehicles.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    // 1) Update vehicle
    const updated = await this.vehicles.update(ctx, id, {
      plate_number: dto.plate_number,
      libre_no: dto.libre_no,
      owner_id: dto.owner_id,
      driver_id: dto.driver_id ?? existing.driver_id,
      make: dto.make,
      model: dto.model,
      color: dto.color,
      capacity: dto.capacity,
      status: dto.vehicle_status,
      is_weekly: dto.is_weekly ?? existing.is_weekly, // ✅ moved to Vehicle
    });

    // 2) Interest adjustments based on status transition
    if (dto.vehicle_status && existing.status !== dto.vehicle_status) {
      const driverId = updated.driver_id ?? null;

      if (
        dto.vehicle_status === VehicleStatus.MAINTENANCE ||
        dto.vehicle_status === VehicleStatus.INACTIVE
      ) {
        await this.subtractTodaysInterestForOverdueDriver(driverId);
      } else if (dto.vehicle_status === VehicleStatus.ACTIVE) {
        await this.reAddTodaysInterestForOverdueDriver(driverId);
      }
    }

    return updated;
  }

  async remove(ctx: UserContext, id: number) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot delete vehicles');
    }

    const existing = await this.vehicles.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    return this.vehicles.remove(ctx, id);
  }


  async resolveForPayment(ctx: UserContext, q: { plate?: string | null; driver_id?: number | null }) {
    let vehicle: { driver_id: number | null; association_id: number; is_weekly: boolean } | null = null;
    let driver: {
      id: number;
      full_name: string;
      phone_number: string;
      active_until_date: Date | null;
      interest_accrued: number | null;
      association_id: number;
      vehicle?: { is_weekly: boolean } | null;
    } | null = null;

    if (q.plate) {
      // 🔎 Lookup by plate
      vehicle = await this.prisma.vehicle.findUnique({
        where: { plate_number: q.plate },
        select: { driver_id: true, association_id: true, is_weekly: true },
      });
      if (!vehicle) throw new NotFoundException('Vehicle not found');
      if (!vehicle.driver_id) throw new BadRequestException('No driver assigned to this plate');

      const d = await this.prisma.driver.findUnique({
        where: { id: vehicle.driver_id },
        select: {
          id: true,
          full_name: true,
          phone_number: true,
          active_until_date: true,
          interest_accrued: true,
          association_id: true,
        },
      });
      if (!d) throw new NotFoundException('Driver not found');

      driver = {
        ...d,
        interest_accrued: d.interest_accrued ? Number(d.interest_accrued) : 0,
      };
    } else if (q.driver_id) {
      // 🔎 Lookup by driver_id
      const d = await this.prisma.driver.findUnique({
        where: { id: q.driver_id },
        select: {
          id: true,
          full_name: true,
          phone_number: true,
          active_until_date: true,
          interest_accrued: true,
          association_id: true,
          vehicle: { select: { is_weekly: true } },
        },
      });
      if (!d) throw new NotFoundException('Driver not found');

      driver = {
        ...d,
        interest_accrued: d.interest_accrued ? Number(d.interest_accrued) : 0,
      };

      vehicle = {
        driver_id: d.id,
        association_id: d.association_id,
        is_weekly: Boolean(d.vehicle?.is_weekly),
      };
    } else {
      throw new BadRequestException('Either plate or driver_id is required');
    }

    if (!driver) throw new NotFoundException('Driver not found');

    const policy = await this.policyRepo.get(driver.association_id);
    if (!policy) throw new NotFoundException('Association policy not found');

    return {
      id: driver.id,
      name: driver.full_name,
      phone: driver.phone_number,
      is_weekly: Boolean(vehicle?.is_weekly),
      active_until_date: driver.active_until_date
        ? new Date(driver.active_until_date).toISOString().slice(0, 10)
        : null,
      interest_accrued: driver.interest_accrued ?? 0,
      policy: {
        plan_fee: Boolean(vehicle?.is_weekly) ? policy.weekly_fee : policy.monthly_fee,
        daily_fine_percent: policy.daily_fine_percent,
      },
    };
  }



  async findAvailableForQuotaOrDirect(
    ctx: UserContext,
    input: { association_id?: number; is_weekly: boolean; start_date: Date; mode: 'quota' | 'direct' }
  ) {
    return this.vehicles.findAvailableForQuotaOrDirect(ctx, input);
  }

}
