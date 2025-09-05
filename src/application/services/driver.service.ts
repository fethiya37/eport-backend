import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DRIVER_REPOSITORY, DriverFilter } from '../../domain/repositories/driver.repository';
import type { IDriverRepository } from '../../domain/repositories/driver.repository';
import { VEHICLE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/vehicle-assignment.repository';
import type { IVehicleAssignmentRepository } from '../../domain/repositories/vehicle-assignment.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDriverDto } from '../../presentation/driver/dto/create-driver.dto';
import { UpdateDriverDto } from '../../presentation/driver/dto/update-driver.dto';
import { DriverStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import * as bcrypt from 'bcrypt';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class DriverService {
  constructor(
    @Inject(DRIVER_REPOSITORY) private readonly drivers: IDriverRepository,
    @Inject(VEHICLE_ASSIGNMENT_REPOSITORY) private readonly assignments: IVehicleAssignmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  // --- helpers ---------------------------------------------------------------

  private startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  private isSameDay(a?: Date | null, b?: Date | null) {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
  }
  private toDateISOOnly(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  /** Pull association rates; returns 0s if not present (schema-safe). */
  private async computeDailyFine(association_id: number, is_weekly: boolean): Promise<number> {
    let weeklyFee = 0;
    let monthlyFee = 0;
    let dailyRate = 0;
    try {
      const rows = await this.prisma.$queryRawUnsafe<
        Array<{ weekly_fee?: unknown; monthly_fee?: unknown; fine_interest_percent_daily?: unknown }>
      >(
        `SELECT weekly_fee, monthly_fee, fine_interest_percent_daily
         FROM associations WHERE id = $1 LIMIT 1`,
        association_id,
      );
      if (rows?.[0]) {
        weeklyFee = Number(rows[0].weekly_fee ?? 0) || 0;
        monthlyFee = Number(rows[0].monthly_fee ?? 0) || 0;
        dailyRate = Number(rows[0].fine_interest_percent_daily ?? 0) || 0;
      }
    } catch {}
    const base = is_weekly ? weeklyFee : monthlyFee;
    const fine = base * dailyRate;
    return Math.round((fine + Number.EPSILON) * 100) / 100;
  }

  /** If today's fine was posted, subtract once via repository. */
  private async subtractTodaysFineIfPosted(ctx: UserContext, driverId: number) {
    const d = await this.drivers.findById(ctx, driverId);
    if (!d || !(d as any).last_accrual_date || !(d as any).last_accrual_amount) return;

    const todayISO = this.toDateISOOnly(new Date());
    const accrualISO = this.toDateISOOnly(new Date((d as any).last_accrual_date));
    if (todayISO !== accrualISO) return;

    const curr = Number((d as any).interest_accrued ?? 0);
    const amt = Number((d as any).last_accrual_amount ?? 0);
    const newInterest = Math.max(0, curr - amt);

    await this.drivers.update(ctx, driverId, {
      interest_accrued: newInterest,
      // keep last_accrual_date (it marks "today was processed"),
      last_accrual_amount: 0,
    });
  }

  /** If still overdue and active vehicle is ACTIVE, re-add today's fine once via repo. */
  private async maybeReAddTodaysFineOnce(ctx: UserContext, driverId: number) {
    const d = await this.drivers.findById(ctx, driverId);
    if (!d) return;

    const today = this.startOfDay(new Date());
    const activeUntil = (d as any).active_until_date ? this.startOfDay(new Date((d as any).active_until_date)) : null;

    // Must still be overdue
    if (!activeUntil || activeUntil >= today) return;

    // Must have ACTIVE vehicle in active pair
    const activePair = await this.assignments.findActiveByDriver(ctx, driverId);
    if (!activePair) return;
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: activePair.vehicle_id },
      select: { status: true },
    });
    if (!vehicle || vehicle.status !== 'ACTIVE') return;

    // Only re-add "once" same day if it was subtracted earlier (marker date == today or last amount == 0 for today)
    const lastDate: Date | null | undefined = (d as any).last_accrual_date ?? null;
    if (lastDate && !this.isSameDay(lastDate, today)) return;

    const fine = await this.computeDailyFine((d as any).association_id, Boolean((d as any).is_weekly));
    if (fine <= 0) return;

    const curr = Number((d as any).interest_accrued ?? 0);
    await this.drivers.update(ctx, driverId, {
      interest_accrued: curr + fine,
      last_accrual_date: today,
      last_accrual_amount: fine,
    });
  }

  // --- CRUD ------------------------------------------------------------------

  // CREATE: create User + Driver + Active Assignment (if vehicle_id present)
  async create(ctx: UserContext, dto: CreateDriverDto) {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create drivers');
    if (!ctx.association_id) throw new BadRequestException('association_id is required');

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicle_id } });
    if (!vehicle || vehicle.association_id !== ctx.association_id) {
      throw new BadRequestException('Vehicle not found in your association');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1) user
      const password_hash = await bcrypt.hash(dto.phone_number, 10);
      const user = await tx.user.create({
        data: {
          phone_number: dto.phone_number,
          user_type: 'Driver',
          name: dto.full_name,
          password_hash,
          is_locked: false,
          association_id: null,
        },
      });

      // 2) driver (includes plan flag)
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

      // 3) active assignment
      await this.assignments.createActive(
        ctx,
        {
          driver_id: driver.id,
          vehicle_id: vehicle.id,
          association_id: ctx.association_id!,
          started_at: new Date(),
        },
        tx,
      );

      return driver;
    });
  }

  // READ: list with active plate
  async findAll(ctx: UserContext, filter: DriverFilter) {
    const list = await this.drivers.findAll(ctx, filter);
    if (list.length === 0) return [];

    const ids = list.map((d) => d.id);
    const actives = await this.assignments.findActiveByDrivers(ctx, ids);
    const byDriver = new Map<number, string>();
    for (const a of actives) byDriver.set(a.driver_id, a.plate_number);

    return list.map((d) => ({
      ...d,
      active_plate_number: byDriver.get(d.id) ?? null,
    }));
  }

  // READ: single with active plate
  async findOneWithActive(ctx: UserContext, id: number) {
    const driver = await this.drivers.findById(ctx, id);
    if (!driver) throw new NotFoundException('Driver not found');

    const active = await this.assignments.findActiveByDriver(ctx, driver.id);
    let active_plate_number: string | null = null;
    if (active) {
      const v = await this.prisma.vehicle.findUnique({
        where: { id: active.vehicle_id },
        select: { plate_number: true },
      });
      active_plate_number = v?.plate_number ?? null;
    }

    return { ...driver, active_plate_number };
  }

  // UPDATE: profile, status, plan toggle, and optional vehicle reassignment
  async update(ctx: UserContext, id: number, dto: UpdateDriverDto) {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot update drivers');

    const existing = await this.drivers.findById(ctx, id);
    if (!existing) throw new NotFoundException('Driver not found');

    // 0) Plan toggle safety: only allow when no active coverage
    if (dto.is_weekly !== undefined && dto.is_weekly !== (existing as any).is_weekly) {
      const todayStart = this.startOfDay(new Date());
      const activeUntil = (existing as any).active_until_date as Date | null | undefined;
      const hasActiveCoverage = !!activeUntil && activeUntil >= todayStart;
      if (hasActiveCoverage) {
        throw new BadRequestException('Cannot change plan while coverage is active');
      }
    }

    // 1) Vehicle reassignment if changed
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

    // 2) Same-day interest side-effects around status changes
    const was = (existing as any).status as DriverStatus | undefined;
    const will = dto.status;

    // If going OFFLINE/SUSPENDED → subtract today's fine once (if posted)
    if (will && (will === DriverStatus.OFFLINE || will === DriverStatus.SUSPENDED) && will !== was) {
      await this.subtractTodaysFineIfPosted(ctx, id);
    }

    // If coming back to AVAILABLE/ON_TRIP same day → after we persist status, we may re-add
    const shouldMaybeReAdd =
      will &&
      (will === DriverStatus.AVAILABLE || will === DriverStatus.ON_TRIP) &&
      will !== was;

    // 3) Persist the main update via repo
    const updated = await this.drivers.update(ctx, id, {
      full_name: dto.full_name,
      phone_number: dto.phone_number,
      status: dto.status,
      license_no: dto.license_no ?? undefined,
      license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : undefined,
      is_weekly: dto.is_weekly ?? undefined,
    });

    // 3.a) If returning to payable status, and still overdue with ACTIVE vehicle → re-add today's fine once
    if (shouldMaybeReAdd) {
      await this.maybeReAddTodaysFineOnce(ctx, id);
    }

    // 4) sync linked user name & phone
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

  // For checkbox UI (kept as-is)
  async listActiveDriverVehiclePairs(ctx: UserContext, associationIdOverride?: number) {
    const association_id = isAdminLike(ctx.user_type)
      ? (associationIdOverride ?? null)
      : (ctx.association_id ?? null);

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
}
