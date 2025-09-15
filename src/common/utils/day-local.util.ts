// Always reason about "today" in Ethiopian local time (EAT, UTC+03).
// No external deps; we just shift the instant by +03:00 and read UTC fields.

const EAT_OFFSET_MIN = 180; // +03:00

/** left-pad 2 digits */
function p2(n: number) { return n < 10 ? `0${n}` : `${n}`; }

/** YYYY-MM-DD from a JS Date, reading UTC fields (no TZ surprises). */
export function ymdUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
}

/** Convert a UTC instant to the corresponding **EAT** calendar date (YYYY-MM-DD). */
export function ymdEATFromInstant(instant: Date): string {
  const eatMs = instant.getTime() + EAT_OFFSET_MIN * 60_000;
  const d = new Date(eatMs);
  return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
}

/** "Today" in **EAT** (YYYY-MM-DD). */
export function todayYmdEAT(now: Date = new Date()): string {
  return ymdEATFromInstant(now);
}

/** Is DB DATE (Date at 00:00Z) **equal** to today's EAT date? */
export function isDbDateEqualTodayEAT(dbDate?: Date | null, now: Date = new Date()): boolean {
  if (!dbDate) return false;
  const dbYmd = ymdUTC(dbDate);        // DB DATE is 00:00Z
  const eatYmd = todayYmdEAT(now);     // local EAT day
  return dbYmd === eatYmd;
}

/** Is DB DATE (Date at 00:00Z) **before** today's EAT date? */
export function isDbDateBeforeTodayEAT(dbDate?: Date | null, now: Date = new Date()): boolean {
  if (!dbDate) return true; // treat null as overdue
  const dbYmd = ymdUTC(dbDate);
  const eatYmd = todayYmdEAT(now);
  return dbYmd < eatYmd;
}
