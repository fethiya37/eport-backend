import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  DRIVER_REPOSITORY,
  DriverFilter,
  type IDriverRepository,
} from '../../domain/repositories/driver.repository';
import {
  VEHICLE_ASSIGNMENT_REPOSITORY,
  type IVehicleAssignmentRepository,
} from '../../domain/repositories/vehicle-assignment.repository';
import {
  ASSOCIATION_POLICY_REPOSITORY,
  type IAssociationPolicyRepository,
} from '../../domain/repositories/association-policy.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDriverDto } from '../../presentation/driver/dto/create-driver.dto';
import { UpdateDriverDto } from '../../presentation/driver/dto/update-driver.dto';
import { DriverStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import * as bcrypt from 'bcrypt';
import type { UserContext } from 'src/common/context/user-context';

@Injectable()
export class DriverService {
  constructor(
    @Inject(DRIVER_REPOSITORY) private readonly drivers: IDriverRepository,
    @Inject(VEHICLE_ASSIGNMENT_REPOSITORY) private readonly assignments: IVehicleAssignmentRepository,
    @Inject(ASSOCIATION_POLICY_REPOSITORY) private readonly policyRepo: IAssociationPolicyRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ===== date helpers (EAT aware) =====
  private pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }

  /** YYYY-MM-DD (UTC) from Date */
  private ymdUTC(d: Date) { return d.toISOString().slice(0, 10); }

  /** YYYY-MM-DD for Ethiopia time (UTC+03) using server clock (DB is UTC) */
  private todayEatYmd(): string {
    const now = new Date();
    const eatMs = now.getTime() + 3 * 3600_000;
    const eat = new Date(eatMs);
    return `${eat.getUTCFullYear()}-${this.pad2(eat.getUTCMonth() + 1)}-${this.pad2(eat.getUTCDate())}`;
  }

  /** True if DB date-only equals "today" in EAT */
  private dbDateEqualsTodayEAT(dbDate?: Date | null): boolean {
    if (!dbDate) return false;
    return this.ymdUTC(dbDate) === this.todayEatYmd();
  }

  /** True if driver is overdue as of "today" EAT (active_until_date < todayEAT) */
  private isOverdueEAT(activeUntil?: Date | null): boolean {
    if (!activeUntil) return true;
    const au = this.ymdUTC(activeUntil);
    return au < this.todayEatYmd();
  }

  private async computeDailyFine(association_id: number, is_weekly: boolean): Promise<number> {
    const policy = await this.policyRepo.get(association_id);
    if (!policy) return 0;
    const base = is_weekly ? policy.weekly_fee : policy.monthly_fee;
    const fine = base * policy.daily_fine_percent;
    return Math.round((fine + Number.EPSILON) * 100) / 100;
  }

  /**
   * SUBTRACT once per day: only if overdue, last_accrual_date == today(EAT) and last_accrual_amount > 0.
   * After subtract: set last_accrual_amount = 0 (flip to "removed" state).
   */
  private async subtractTodaysFineIfPosted(ctx: UserContext, driverId: number) {
    const d = await this.drivers.findById(ctx, driverId);
    if (!d) return;

    const overdue = this.isOverdueEAT((d as any).active_until_date ?? null);
    if (!overdue) return;

    const lastDate: Date | null | undefined = (d as any).last_accrual_date ?? null;
    const sameLocalDay = this.dbDateEqualsTodayEAT(lastDate);
    if (!sameLocalDay) return;

    const lastAmt = Number((d as any).last_accrual_amount ?? 0);
    if (!(lastAmt > 0)) return;

    const curr = Number((d as any).interest_accrued ?? 0);
    const newInterest = Math.max(0, curr - lastAmt);

    await this.drivers.update(ctx, driverId, {
      interest_accrued: newInterest,
      last_accrual_amount: 0, // guard: prevents double-subtract & enables one re-add
    });
  }

  /**
   * RE-ADD once per day: only if overdue, last_accrual_date == today(EAT) and last_accrual_amount == 0.
   * After re-add: set last_accrual_amount = delta (flip back to "posted" state).
   */
  private async maybeReAddTodaysFineOnce(ctx: UserContext, driverId: number) {
    const d = await this.drivers.findById(ctx, driverId);
    if (!d) return;

    const overdue = this.isOverdueEAT((d as any).active_until_date ?? null);
    if (!overdue) return;

    const sameLocalDay = this.dbDateEqualsTodayEAT((d as any).last_accrual_date ?? null);
    if (!sameLocalDay) return;

    const lastAmt = Number((d as any).last_accrual_amount ?? 0);
    if (lastAmt !== 0) return; // already "posted" today; skip duplicate re-add

    const delta = await this.computeDailyFine((d as any).association_id, Boolean((d as any).is_weekly));
    if (delta <= 0) return;

    const curr = Number((d as any).interest_accrued ?? 0);
    await this.drivers.update(ctx, driverId, {
      interest_accrued: curr + delta,
      last_accrual_amount: delta, // mark as "posted"
    });
  }

  // ===== basic helpers =====
  private startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  // CREATE: user + driver + (optional) active assignment
  async create(ctx: UserContext, dto: CreateDriverDto) {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create drivers');
    if (!ctx.association_id) throw new BadRequestException('association_id is required');

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicle_id } });
    if (!vehicle || vehicle.association_id !== ctx.association_id) {
      throw new BadRequestException('Vehicle not found in your association');
    }

    return this.prisma.$transaction(async (tx) => {
      const password_hash = await bcrypt.hash(dto.phone_number, 10);

      const user = await tx.user.create({
        data: {
          phone_number: dto.phone_number,
          user_type: 'Driver',
          name: dto.full_name,
          password_hash,
          is_locked: false,
          association_id: ctx.association_id!,
        },
      });

      const driver = await this.drivers.create(
        ctx,
        {
          user_id: user.id,
          association_id: ctx.association_id!,
          full_name: dto.full_name,
          phone_number: dto.phone_number,
          license_no: dto.license_no ?? null,
          license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : null,
          is_weekly: dto.is_weekly ?? false,
        },
        tx,
      );

      await this.assignments.createActive(
        ctx,
        { driver_id: driver.id, vehicle_id: vehicle.id, association_id: ctx.association_id!, started_at: new Date() },
        tx,
      );

      return driver;
    });
  }

  async findAll(ctx: UserContext, filter: DriverFilter) {
    const list = await this.drivers.findAll(ctx, filter);
    if (list.length === 0) return [];
    const ids = list.map((d) => d.id);
    const actives = await this.assignments.findActiveByDrivers(ctx, ids);
    const byDriver = new Map<number, string>();
    for (const a of actives) byDriver.set(a.driver_id, a.plate_number);
    return list.map((d) => ({ ...d, active_plate_number: byDriver.get(d.id) ?? null }));
  }

  async findOneWithActive(ctx: UserContext, id: number) {
    const driver = await this.drivers.findById(ctx, id);
    if (!driver) throw new NotFoundException('Driver not found');

    const active = await this.assignments.findActiveByDriver(ctx, driver.id);
    let active_plate_number: string | null = null;
    if (active) {
      const v = await this.prisma.vehicle.findUnique({ where: { id: active.vehicle_id }, select: { plate_number: true } });
      active_plate_number = v?.plate_number ?? null;
    }
    return { ...driver, active_plate_number };
  }

  async update(ctx: UserContext, id: number, dto: UpdateDriverDto) {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot update drivers');

    const existing = await this.drivers.findById(ctx, id);
    if (!existing) throw new NotFoundException('Driver not found');

    if (dto.is_weekly !== undefined && dto.is_weekly !== (existing as any).is_weekly) {
      const todayStart = this.startOfDay(new Date());
      const activeUntil = (existing as any).active_until_date as Date | null | undefined;
      if (activeUntil && activeUntil >= todayStart) {
        throw new BadRequestException('Cannot change plan while coverage is active');
      }
    }

    if (dto.vehicle_id) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicle_id } });
      if (!vehicle || vehicle.association_id !== (existing as any).association_id) {
        throw new BadRequestException('Vehicle must belong to your association');
      }
      const active = await this.assignments.findActiveByDriver(ctx, id);
      if (!active || active.vehicle_id !== dto.vehicle_id) {
        if (active) await this.assignments.closeActiveForDriver(ctx, id, new Date());
        await this.assignments.createActive(ctx, {
          driver_id: id,
          vehicle_id: dto.vehicle_id,
          association_id: (existing as any).association_id,
          started_at: new Date(),
        });
      }
    }

    const was = (existing as any).status as DriverStatus | undefined;
    const will = dto.status;

    // status -> interest effects
    if (will && (will === DriverStatus.OFFLINE || will === DriverStatus.SUSPENDED) && will !== was) {
      await this.subtractTodaysFineIfPosted(ctx, id);
    }
    const shouldMaybeReAdd =
      will && (will === DriverStatus.AVAILABLE || will === DriverStatus.ON_TRIP) && will !== was;

    const updated = await this.drivers.update(ctx, id, {
      full_name: dto.full_name,
      phone_number: dto.phone_number,
      status: dto.status,
      license_no: dto.license_no ?? undefined,
      license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : undefined,
      is_weekly: dto.is_weekly ?? undefined,
    });

    if (shouldMaybeReAdd) await this.maybeReAddTodaysFineOnce(ctx, id);

    if (dto.full_name !== undefined || dto.phone_number !== undefined) {
      await this.prisma.user.update({
        where: { id: (updated as any).user_id },
        data: {
          ...(dto.full_name !== undefined ? { name: dto.full_name } : {}),
          ...(dto.phone_number !== undefined ? { phone_number: dto.phone_number } : {}),
        },
      });
    }

    return updated;
  }

  async listActiveDriverVehiclePairs(ctx: UserContext, associationIdOverride?: number) {
    const association_id = isAdminLike(ctx.user_type) ? associationIdOverride ?? null : ctx.association_id ?? null;
    if (!association_id) throw new BadRequestException('association_id is required');

    const rows = await this.prisma.vehicleAssignment.findMany({
      where: { association_id, active: true },
      include: { driver: true, vehicle: true },
      orderBy: { started_at: 'desc' },
    });

    return rows.map((r) => ({
      driver_id: r.driver_id,
      driver_name: r.driver.full_name,
      driver_status: r.driver.status,
      vehicle_id: r.vehicle_id,
      plate_number: r.vehicle.plate_number,
      vehicle_status: r.vehicle.status,
      started_at: r.started_at,
    }));
  }

  async resolveForPayment(ctx: UserContext, q: { plate?: string | null; phone?: string | null }) {
    let driverId: number | null = null;

    if (q.plate) {
      const v = await this.prisma.vehicle.findUnique({
        where: { plate_number: q.plate },
        select: { id: true, association_id: true },
      });
      if (!v) throw new NotFoundException('Vehicle not found');

      const active = await this.prisma.vehicleAssignment.findFirst({
        where: { vehicle_id: v.id, association_id: v.association_id, active: true },
        select: { driver_id: true },
      });
      if (!active) throw new BadRequestException('No active driver–vehicle assignment for this plate');
      driverId = active.driver_id;
    } else if (q.phone) {
      const d = await this.prisma.driver.findFirst({
        where: {
          phone_number: q.phone,
          ...(isAdminLike(ctx.user_type) || !ctx.association_id ? {} : { association_id: ctx.association_id }),
        },
        select: { id: true },
      });
      if (!d) throw new NotFoundException('Driver not found');
      driverId = d.id;
    } else {
      throw new BadRequestException('plate or phone is required');
    }

    const d = await this.prisma.driver.findUnique({
      where: { id: driverId! },
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        is_weekly: true,
        active_until_date: true,
        interest_accrued: true,
        association_id: true,
      },
    });
    if (!d) throw new NotFoundException('Driver not found');

    const policy = await this.policyRepo.get(d.association_id);
    if (!policy) throw new NotFoundException('Association policy not found');

    return {
      id: d.id,
      name: d.full_name,
      phone: d.phone_number,
      is_weekly: Boolean(d.is_weekly),
      active_until_date: d.active_until_date ? new Date(d.active_until_date).toISOString().slice(0, 10) : null,
      interest_accrued: Number(d.interest_accrued ?? 0),
      policy: {
        plan_fee: Boolean(d.is_weekly) ? policy.weekly_fee : policy.monthly_fee,
        daily_fine_percent: policy.daily_fine_percent,
      },
    };
  }
}
