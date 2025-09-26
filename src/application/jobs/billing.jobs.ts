// src/application/jobs/billing-jobs.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { VehicleStatus } from '@prisma/client';

// -----------------------------
// EAT (UTC+03) date helpers
// -----------------------------
function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

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

/** Is overdue as of EAT "today"? */
function isOverdueEat(activeUntil?: Date | null, todayEatYmd?: string): boolean {
  const today = todayEatYmd ?? eatYmdNow();
  const au = activeUntil ? ymdUTC(activeUntil) : null;
  return !au || au < today;
}

// -----------------------------
// Ethiopian Calendar (UTC-safe)
// -----------------------------
const EC_EPOCH_JDN = 1724221; // JDN for EC 1-1-1

function gcToJdnUTC(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
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
  constructor(private readonly prisma: PrismaService) { }

  // --------------------------------------------------------------------------
  // DAILY FINE — runs every day 00:05 in EAT (UTC+03)
  // --------------------------------------------------------------------------
  @Cron('5 0 * * *', { timeZone: 'Africa/Addis_Ababa' })
  async dailyFine() {
    const todayEat = eatYmdNow();
    const todayEatDateUtc = ymdToUtcDate(todayEat);

    // Fetch all ACTIVE vehicles with linked drivers
    const vehicles = await this.prisma.vehicle.findMany({
      where: { status: VehicleStatus.ACTIVE, driver_id: { not: null } },
      select: {
        id: true,
        association_id: true,
        is_weekly: true,
        driver: {
          select: {
            id: true,
            active_until_date: true,
            interest_accrued: true,
          },
        },
      },
    });

    for (const v of vehicles) {
      if (!v.driver) continue;
      if (!isOverdueEat(v.driver.active_until_date, todayEat)) continue;

      // Association policy
      let weeklyFee = 0,
        monthlyFee = 0,
        rate = 0;
      try {
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT weekly_fee, monthly_fee, daily_fine_percent
           FROM association_policies
           WHERE association_id = $1
           LIMIT 1`,
          v.association_id,
        );
        if (rows?.[0]) {
          weeklyFee = Number(rows[0].weekly_fee ?? 0) || 0;
          monthlyFee = Number(rows[0].monthly_fee ?? 0) || 0;
          rate = Number(rows[0].daily_fine_percent ?? 0) || 0;
        }
      } catch {
        // ignore
      }

      const base = v.is_weekly ? weeklyFee : monthlyFee;
      const add = Math.round((base * rate + Number.EPSILON) * 100) / 100;
      if (add <= 0) continue;

      await this.prisma.driver.update({
        where: { id: v.driver.id },
        data: {
          interest_accrued: (Number(v.driver.interest_accrued ?? 0) + add) as any,
          last_accrual_date: todayEatDateUtc,
          last_accrual_amount: add as any,
        },
      });
    }

    this.logger.log(`[dailyFine] done for EAT ${todayEat}`);
  }
}
