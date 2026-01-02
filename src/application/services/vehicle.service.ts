import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import {
  VEHICLE_REPOSITORY,
  VehicleFilter,
} from '../../domain/repositories/vehicle.repository';
import { CreateVehicleDto } from '../../presentation/vehicle/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../../presentation/vehicle/dto/update-vehicle.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { VehicleStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';
import {
  ASSOCIATION_POLICY_REPOSITORY,
  type IAssociationPolicyRepository,
} from '../../domain/repositories/association-policy.repository';
import { ActivityLogService } from '../services/activity-log.service';

@Injectable()
export class VehicleService {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: IVehicleRepository,
    @Inject(ASSOCIATION_POLICY_REPOSITORY)
    private readonly policyRepo: IAssociationPolicyRepository,
    private readonly prisma: PrismaService,
    private readonly activityLog: ActivityLogService,
  ) {}

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
        vehicle: { select: { is_weekly: true } },
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
        vehicle: { select: { is_weekly: true } },
      },
    });

    if (!d) return;
    const overdue = this.isOverdueEAT(d.active_until_date ?? null);
    if (!overdue) return;

    const sameLocalDay = this.dbDateEqualsTodayEAT(d.last_accrual_date ?? null);
    if (!sameLocalDay) return;

    const lastAmt = Number(d.last_accrual_amount ?? 0);
    if (lastAmt !== 0) return;

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

  async create(ctx: UserContext, dto: CreateVehicleDto) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot create vehicles');
    }
    if (!ctx.association_id) {
      throw new BadRequestException('association_id is required');
    }

    const created = await this.vehicles.create(ctx, {
      plate_number: dto.plate_number.trim(),
      libre_no: dto.libre_no ? dto.libre_no.trim() : null,
      owner_id: dto.owner_id,
      association_id: ctx.association_id!,
      driver_id: dto.driver_id ?? null,
      make: dto.make ? dto.make.trim() : null,
      model: dto.model ? dto.model.trim() : null,
      color: dto.color ? dto.color.trim() : null,
      capacity: dto.capacity ?? null,
      is_weekly: dto.is_weekly ?? false,
    });

    await this.activityLog.log(ctx, {
      module: 'Vehicle',
      action: 'CREATE',
      entity: 'Vehicle',
      entity_id: created.id,
    });

    return created;
  }

  findAll(ctx: UserContext, filter: VehicleFilter & { association_id?: number }) {
    return this.vehicles.findAll(ctx, filter);
  }

  async findOne(ctx: UserContext, id: number) {
    const v = await this.vehicles.findById(ctx, id);
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  async update(ctx: UserContext, id: number, dto: UpdateVehicleDto) {
    const existing = await this.vehicles.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    // ✅ Admin can update; Association must stay in its association (repo enforces)
    const updated = await this.vehicles.update(ctx, id, {
      plate_number: dto.plate_number ? dto.plate_number.trim() : dto.plate_number,
      libre_no: dto.libre_no ? dto.libre_no.trim() : dto.libre_no,
      owner_id: dto.owner_id,
      driver_id: dto.driver_id ?? existing.driver_id,
      make: dto.make ? dto.make.trim() : dto.make,
      model: dto.model ? dto.model.trim() : dto.model,
      color: dto.color ? dto.color.trim() : dto.color,
      capacity: dto.capacity,
      status: dto.vehicle_status,
      is_weekly: dto.is_weekly ?? existing.is_weekly,
    });

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

    await this.activityLog.log(ctx, {
      module: 'Vehicle',
      action: 'UPDATE',
      entity: 'Vehicle',
      entity_id: id,
    });

    return updated;
  }

  async remove(ctx: UserContext, id: number) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot delete vehicles');
    }

    const existing = await this.vehicles.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    const deleted = await this.vehicles.remove(ctx, id);

    await this.activityLog.log(ctx, {
      module: 'Vehicle',
      action: 'DELETE',
      entity: 'Vehicle',
      entity_id: id,
    });

    return deleted;
  }

  // ✅ scoped for Association, unscoped for Driver
  async resolveForPayment(
    ctx: UserContext,
    q: { plate?: string | null; driver_id?: number | null },
  ) {
    const isAssociationUser = ctx.user_type === 'Association';
    const assocId = ctx.association_id ?? null;

    if (isAssociationUser && !assocId) {
      throw new BadRequestException('association context required');
    }

    const plate = q.plate?.trim();

    let vehicle:
      | { driver_id: number | null; association_id: number; is_weekly: boolean; plate_number?: string }
      | null = null;

    let driver:
      | {
          id: number;
          full_name: string;
          active_until_date: Date | null;
          interest_accrued: number | null;
          association_id: number;
          vehicle?: { is_weekly: boolean; plate_number?: string } | null;
        }
      | null = null;

    if (plate) {
      vehicle = await this.prisma.vehicle.findUnique({
        where: { plate_number: plate },
        select: {
          driver_id: true,
          association_id: true,
          is_weekly: true,
          plate_number: true,
        },
      });
      if (!vehicle) throw new NotFoundException('Vehicle not found');

      // ✅ Association must not resolve other association
      if (isAssociationUser && vehicle.association_id !== assocId) {
        throw new ForbiddenException('Not in your association');
      }

      if (!vehicle.driver_id) throw new BadRequestException('No driver assigned to this plate');

      const d = await this.prisma.driver.findUnique({
        where: { id: vehicle.driver_id },
        select: {
          id: true,
          full_name: true,
          active_until_date: true,
          interest_accrued: true,
          association_id: true,
        },
      });
      if (!d) throw new NotFoundException('Driver not found');

      // ✅ Association must not resolve other association (double-check)
      if (isAssociationUser && d.association_id !== assocId) {
        throw new ForbiddenException('Not in your association');
      }

      driver = {
        ...d,
        interest_accrued: d.interest_accrued ? Number(d.interest_accrued) : 0,
      };
    } else if (q.driver_id) {
      const d = await this.prisma.driver.findUnique({
        where: { id: q.driver_id },
        select: {
          id: true,
          full_name: true,
          active_until_date: true,
          interest_accrued: true,
          association_id: true,
          vehicle: { select: { is_weekly: true, plate_number: true } },
        },
      });
      if (!d) throw new NotFoundException('Driver not found');

      // ✅ Association must not resolve other association
      if (isAssociationUser && d.association_id !== assocId) {
        throw new ForbiddenException('Not in your association');
      }

      if (!d.vehicle) throw new BadRequestException('This driver does not have a vehicle assigned');

      driver = {
        ...d,
        interest_accrued: d.interest_accrued ? Number(d.interest_accrued) : 0,
      };

      vehicle = {
        driver_id: d.id,
        association_id: d.association_id,
        is_weekly: Boolean(d.vehicle.is_weekly),
        plate_number: d.vehicle.plate_number ?? undefined,
      };
    } else {
      throw new BadRequestException('Either plate or driver_id is required');
    }

    if (!driver || !vehicle) throw new NotFoundException('Driver/Vehicle not found');

    const policy = await this.policyRepo.get(driver.association_id);
    if (!policy) throw new NotFoundException('Association policy not found');

    const association = await this.prisma.association.findUnique({
      where: { id: driver.association_id },
      select: { name: true },
    });

    return {
      association_name: association?.name ?? '',
      driver_name: driver.full_name,
      plate_number: vehicle.plate_number ?? null,
      is_weekly: Boolean(vehicle.is_weekly),
      active_until_date: driver.active_until_date
        ? new Date(driver.active_until_date).toISOString().slice(0, 10)
        : null,
      interest_accrued: driver.interest_accrued ?? 0,
      policy: {
        plan_fee: Boolean(vehicle.is_weekly) ? policy.weekly_fee : policy.monthly_fee,
        daily_fine_percent: policy.daily_fine_percent,
      },
    };
  }

  async findAvailableForQuotaOrDirect(
    ctx: UserContext,
    input: {
      association_id?: number;
      is_weekly: boolean;
      start_date: Date;
      mode: 'quota' | 'direct';
    },
  ) {
    return this.vehicles.findAvailableForQuotaOrDirect(ctx, input);
  }
}
