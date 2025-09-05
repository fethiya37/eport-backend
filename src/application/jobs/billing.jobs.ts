import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { startOfDay, startOfWeekMonday, nextWeekMonday, etMonthStart, isFirstDayOfEthiopianMonth } from '../../common/utils/ethio-period.util';
import { ROUTE_ASSIGNMENT_REPOSITORY, type IRouteAssignmentRepository } from '../../domain/repositories/route-assignment.repository';

@Injectable()
export class BillingJobs {
  private readonly logger = new Logger(BillingJobs.name);
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ROUTE_ASSIGNMENT_REPOSITORY) private readonly routesRepo: IRouteAssignmentRepository,
  ) {}

  // ========== DAILY FINE (00:05) ==========
  @Cron('5 0 * * *')
  async dailyFine() {
    const today = startOfDay(new Date());

    // Load candidate drivers: AVAILABLE or ON_TRIP
    const drivers = await this.prisma.driver.findMany({
      where: { status: { in: ['AVAILABLE','ON_TRIP'] } },
      select: {
        id: true, association_id: true, is_weekly: true, active_until_date: true,
        interest_accrued: true,
      } as any,
    });

    for (const d of drivers as any[]) {
      const activeUntil = d.active_until_date ? startOfDay(new Date(d.active_until_date)) : null;
      const overdue = !activeUntil || activeUntil < today;
      if (!overdue) continue;

      // Active vehicle must be ACTIVE
      const activePair = await this.prisma.vehicleAssignment.findFirst({
        where: { driver_id: d.id, association_id: d.association_id, active: true },
        select: { vehicle_id: true },
      });
      if (!activePair) continue;

      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: activePair.vehicle_id },
        select: { status: true },
      });
      if (!vehicle || vehicle.status !== 'ACTIVE') continue;

      // Pull policy
      let weeklyFee = 0, monthlyFee = 0, rate = 0;
      try {
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT weekly_fee, monthly_fee, daily_fine_percent FROM association_policies WHERE association_id = $1 LIMIT 1`,
          d.association_id,
        );
        if (rows?.[0]) {
          weeklyFee = Number(rows[0].weekly_fee ?? 0) || 0;
          monthlyFee = Number(rows[0].monthly_fee ?? 0) || 0;
          rate = Number(rows[0].daily_fine_percent ?? 0) || 0;
        }
      } catch {}

      const base = d.is_weekly ? weeklyFee : monthlyFee;
      const add = Math.round((base * rate + Number.EPSILON) * 100) / 100;
      if (add <= 0) continue;

      await this.prisma.driver.update({
        where: { id: d.id },
        data: {
          interest_accrued: (Number(d.interest_accrued ?? 0) + add) as any,
          last_accrual_date: today,
          last_accrual_amount: add as any,
        },
      });
    }

    this.logger.log('Daily fine job done.');
  }

  // ========== WEEKLY BOUNDARY (Mon 00:05) ==========
  @Cron('5 0 * * 1')
  async weeklyBoundary() {
    const today = startOfDay(new Date()); // Monday
    // Flip payment_status to INACTIVE for weekly drivers overdue (skip SUSPENDED).
    // If your schema lacks payment_status, this raw SQL will no-op on error.
    try {
      await this.prisma.$executeRawUnsafe(`
        UPDATE drivers
        SET payment_status = 'INACTIVE'
        WHERE is_weekly = true
          AND status != 'SUSPENDED'
          AND (active_until_date IS NULL OR DATE(active_until_date) < DATE($1))
      `, today);
    } catch {/* ignore if column not present */}

    // Status normalize: ON_TRIP -> AVAILABLE if no approved assignment today
    const weeklyDrivers = await this.prisma.driver.findMany({
      where: { is_weekly: true, status: 'ON_TRIP' },
      select: { id: true, association_id: true },
    });
    for (const d of weeklyDrivers) {
      const has = await this.routesRepo.hasApprovedOnDate(d.association_id, d.id, today);
      if (!has) {
        await this.prisma.driver.update({
          where: { id: d.id },
          data: { status: 'AVAILABLE' as any },
        });
      }
    }
  }

  // ========== MONTHLY BOUNDARY (EC Month start 00:05) ==========
  // Run every day 00:05 and trigger only on EC month start (incl. Pagume handling).
  @Cron('5 0 * * *')
  async monthlyBoundaryEC() {
    const today = startOfDay(new Date());
    if (!isFirstDayOfEthiopianMonth(today)) return;

    try {
      await this.prisma.$executeRawUnsafe(`
        UPDATE drivers
        SET payment_status = 'INACTIVE'
        WHERE is_weekly = false
          AND status != 'SUSPENDED'
          AND (active_until_date IS NULL OR DATE(active_until_date) < DATE($1))
      `, today);
    } catch {/* ignore if column not present */}

    // Status normalize for monthly drivers at EC month start
    const monthlyDrivers = await this.prisma.driver.findMany({
      where: { is_weekly: false, status: 'ON_TRIP' },
      select: { id: true, association_id: true },
    });
    for (const d of monthlyDrivers) {
      const has = await this.routesRepo.hasApprovedOnDate(d.association_id, d.id, today);
      if (!has) {
        await this.prisma.driver.update({
          where: { id: d.id },
          data: { status: 'AVAILABLE' as any },
        });
      }
    }
  }
}
