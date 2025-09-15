import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

// -----------------------------
// EAT (UTC+03) date helpers
// -----------------------------
function pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }

/** Returns today's date in EAT as YYYY-MM-DD */
function eatYmdNow(): string {
  const now = new Date();
  const eatMs = now.getTime() + 3 * 3600_000; // UTC+03
  const d = new Date(eatMs);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/** Build a Date at UTC midnight for a given YYYY-MM-DD */
function ymdToUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Inclusive day range [from, to] in UTC for the given EAT YYYY-MM-DD */
function eatDayRangeUtc(ymd: string): { from: Date; to: Date } {
  const from = ymdToUtcDate(ymd);
  const to = new Date(from.getTime() + 86_400_000 - 1); // 23:59:59.999 UTC
  return { from, to };
}

/** Compare two dates (DB DATEs or JS Dates) by YYYY-MM-DD in UTC */
function ymdUTC(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

/** Is driver overdue as of EAT "today"? */
function isOverdueEat(activeUntil?: Date | null, todayEatYmd?: string): boolean {
  const today = todayEatYmd ?? eatYmdNow();
  const au = activeUntil ? ymdUTC(activeUntil) : null;
  return !au || au < today;
}

// -----------------------------
// Ethiopian Calendar (UTC-safe)
// -----------------------------
// We do EC conversion in UTC so host timezone never affects the result.

const EC_EPOCH_JDN = 1724221; // JDN for EC 1-1-1

function gcToJdnUTC(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d
    + Math.floor((153 * m2 + 2) / 5)
    + 365 * y2
    + Math.floor(y2 / 4)
    - Math.floor(y2 / 100)
    + Math.floor(y2 / 400)
    - 32045;
}

function ecFromGcUTC(g: Date): { year: number; month: number; day: number } {
  const j = gcToJdnUTC(g);
  const r = j - EC_EPOCH_JDN;
  const quad = Math.floor(r / 1461);
  const rem = r % 1461;
  const year = quad * 4 + Math.floor(rem / 365) + 1;
  const doy = rem % 365;
  const month = Math.floor(doy / 30) + 1;
  const day = (doy % 30) + 1;
  return { year, month, day };
}

function isFirstDayOfEthiopianMonthUTC(g: Date): boolean {
  const ec = ecFromGcUTC(g);
  return ec.day === 1;
}

@Injectable()
export class BillingJobs {
  private readonly logger = new Logger(BillingJobs.name);
  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // DAILY FINE — runs every day 00:05 in EAT (UTC+03)
  // --------------------------------------------------------------------------
  @Cron('5 0 * * *', { timeZone: 'Africa/Addis_Ababa' })
  async dailyFine() {
    const todayEat = eatYmdNow();
    const todayEatDateUtc = ymdToUtcDate(todayEat); // write markers as UTC midnight of EAT date

    // Candidates that can accrue fines today (AVAILABLE or ON_TRIP)
    const drivers = await this.prisma.driver.findMany({
      where: { status: { in: ['AVAILABLE', 'ON_TRIP'] } },
      select: {
        id: true,
        association_id: true,
        is_weekly: true,
        active_until_date: true,
        interest_accrued: true,
      } as const,
    });

    for (const d of drivers) {
      if (!isOverdueEat(d.active_until_date, todayEat)) continue;

      // Must have an active driver–vehicle pair
      const pair = await this.prisma.vehicleAssignment.findFirst({
        where: { driver_id: d.id, association_id: d.association_id, active: true },
        select: { vehicle_id: true },
      });
      if (!pair) continue;

      // Vehicle must be ACTIVE
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: pair.vehicle_id },
        select: { status: true },
      });
      if (!vehicle || vehicle.status !== 'ACTIVE') continue;

      // Association policy: weekly_fee, monthly_fee, daily_fine_percent
      let weeklyFee = 0, monthlyFee = 0, rate = 0;
      try {
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT weekly_fee, monthly_fee, daily_fine_percent
           FROM association_policies
           WHERE association_id = $1
           LIMIT 1`,
          d.association_id,
        );
        if (rows?.[0]) {
          weeklyFee = Number(rows[0].weekly_fee ?? 0) || 0;
          monthlyFee = Number(rows[0].monthly_fee ?? 0) || 0;
          rate = Number(rows[0].daily_fine_percent ?? 0) || 0;
        }
      } catch {
        // If policy table not present, treat as zero
      }

      const base = d.is_weekly ? weeklyFee : monthlyFee;
      const add = Math.round((base * rate + Number.EPSILON) * 100) / 100;
      if (add <= 0) continue;

      await this.prisma.driver.update({
        where: { id: d.id },
        data: {
          interest_accrued: (Number(d.interest_accrued ?? 0) + add) as any,
          last_accrual_date: todayEatDateUtc, // DATE column; use EAT day anchored at UTC midnight
          last_accrual_amount: add as any,
        },
      });
    }

    this.logger.log(`[dailyFine] done for EAT ${todayEat}`);
  }

  // --------------------------------------------------------------------------
  // WEEKLY BOUNDARY — every Monday 00:05 in EAT
  // - Flip payment_status to INACTIVE for overdue weekly drivers (skip SUSPENDED)
  // - Normalize ON_TRIP -> AVAILABLE if no assignment exists today
  // --------------------------------------------------------------------------
  @Cron('5 0 * * 1', { timeZone: 'Africa/Addis_Ababa' })
  async weeklyBoundary() {
    const todayEat = eatYmdNow();
    const todayEatDateUtc = ymdToUtcDate(todayEat);

    // Flip payment_status for overdue WEEKLY drivers (guard if column missing)
    try {
      await this.prisma.$executeRawUnsafe(
        `
        UPDATE drivers
        SET payment_status = 'INACTIVE'
        WHERE is_weekly = true
          AND status != 'SUSPENDED'
          AND (active_until_date IS NULL OR active_until_date < DATE($1))
        `,
        todayEatDateUtc,
      );
    } catch {
      // payment_status may not exist yet; ignore
    }

    // Normalize ON_TRIP when there is no assignment overlapping EAT today
    const weeklyOnTrip = await this.prisma.driver.findMany({
      where: { is_weekly: true, status: 'ON_TRIP' },
      select: { id: true, association_id: true },
    });

    const range = eatDayRangeUtc(todayEat);
    for (const d of weeklyOnTrip) {
      const exists = await this.hasAnyAssignmentInRange(d.association_id, d.id, range.from, range.to);
      if (!exists) {
        await this.prisma.driver.update({
          where: { id: d.id },
          data: { status: 'AVAILABLE' as any },
        });
      }
    }

    this.logger.log(`[weeklyBoundary] done for EAT ${todayEat}`);
  }

  // --------------------------------------------------------------------------
  // MONTHLY BOUNDARY (EC) — runs daily 00:05 in EAT, executes only on EC day-1
  // - Flip payment_status to INACTIVE for overdue monthly drivers (skip SUSPENDED)
  // - Normalize ON_TRIP -> AVAILABLE if no assignment exists today
  // --------------------------------------------------------------------------
  @Cron('5 0 * * *', { timeZone: 'Africa/Addis_Ababa' })
  async monthlyBoundaryEC() {
    const todayEat = eatYmdNow();
    const todayEatDateUtc = ymdToUtcDate(todayEat);

    // Only run on EC day-1 (using UTC-safe EC converter)
    if (!isFirstDayOfEthiopianMonthUTC(todayEatDateUtc)) return;

    try {
      await this.prisma.$executeRawUnsafe(
        `
        UPDATE drivers
        SET payment_status = 'INACTIVE'
        WHERE is_weekly = false
          AND status != 'SUSPENDED'
          AND (active_until_date IS NULL OR active_until_date < DATE($1))
        `,
        todayEatDateUtc,
      );
    } catch {
      // payment_status may not exist yet; ignore
    }

    const monthlyOnTrip = await this.prisma.driver.findMany({
      where: { is_weekly: false, status: 'ON_TRIP' },
      select: { id: true, association_id: true },
    });

    const range = eatDayRangeUtc(todayEat);
    for (const d of monthlyOnTrip) {
      const exists = await this.hasAnyAssignmentInRange(d.association_id, d.id, range.from, range.to);
      if (!exists) {
        await this.prisma.driver.update({
          where: { id: d.id },
          data: { status: 'AVAILABLE' as any },
        });
      }
    }

    this.logger.log(`[monthlyBoundaryEC] done for EAT ${todayEat}`);
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  /** True if driver has at least one assignment overlapping [from,to] (UTC). */
  private async hasAnyAssignmentInRange(
    association_id: number,
    driver_id: number,
    fromUtc: Date,
    toUtc: Date,
  ): Promise<boolean> {
    const row = await this.prisma.routeAssignment.findFirst({
      where: {
        association_id,
        driver_id,
        start_date: { lte: toUtc },
        end_date: { gte: fromUtc },
      },
      select: { id: true },
    });
    return !!row;
  }
}
