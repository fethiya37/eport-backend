// src/common/utils/ethio-period.util.ts

// ===== GC day helpers =====
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/** Monday-start week (GC). Matches your Flutter logic. */
export function startOfWeekMonday(d: Date): Date {
  const dt = startOfDay(d);
  const dow = dt.getDay(); // 0=Sun..6=Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + diff);
  return dt;
}

// ===== EC <-> GC (JDN based, same approach as your Flutter) =====
const EC_EPOCH_JDN = 1724221; // JDN for EC 1-1-1 (መስከረም 1, year 1)

function gcToJdn(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
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

function jdnToGc(jdn: number): Date {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return new Date(year, month - 1, day);
}

function ecToJdn(y: number, m: number, d: number): number {
  return EC_EPOCH_JDN - 1 + 365 * (y - 1) + Math.floor((y - 1) / 4) + 30 * (m - 1) + d;
}

function ecFromGc(g: Date): { year: number; month: number; day: number } {
  const j = gcToJdn(startOfDay(g));
  const r = j - EC_EPOCH_JDN;
  const quad = Math.floor(r / 1461);
  const rem = r % 1461;
  const year = quad * 4 + Math.floor(rem / 365) + 1;
  const doy = rem % 365;
  const month = Math.floor(doy / 30) + 1;
  const day = (doy % 30) + 1;
  return { year, month, day };
}

function gcFromEc(y: number, m: number, d: number): Date {
  const jdn = ecToJdn(y, m, d);
  return jdnToGc(jdn);
}

/** EC month start for the given GC date (returns GC local midnight). */
export function etMonthStart(d: Date): Date {
  const { year, month } = ecFromGc(d);
  return startOfDay(gcFromEc(year, month, 1));
}

/** Is the provided GC date the first day of the EC month? */
export function isFirstDayOfEthiopianMonth(d: Date): boolean {
  return startOfDay(etMonthStart(d)).getTime() === startOfDay(d).getTime();
}

// (Optional) expose raw converters if other modules need them:
export const EthioCal = { ecFromGc, gcFromEc };
