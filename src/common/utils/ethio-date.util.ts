import { EtDatetime } from 'abushakir';

// Narrow the shape of EtDatetime.date for TS
type EtDate = { year: number; month: number; day: number };

/**
 * Convert Ethiopian 'YYYY-MM-DD' to a JS Date (Gregorian, local time).
 * Example: '2017-01-10' (EC) -> Date (GC)
 */
export function etDateToGregorian(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  const et = new EtDatetime(y, m, d);         // Ethiopian date
  return new Date(et.moment);                 // GC timestamp → JS Date
}

/**
 * Convert a JS Date (Gregorian) to Ethiopian components.
 * Returns { year, month, day } in Ethiopian calendar.
 */
export function gregorianToEt(g: Date): EtDate {
  const ec = new EtDatetime(g.getTime());     // Ethiopian date from GC ms
  const { year, month, day } = ec.date as EtDate;
  return { year, month, day };
}

/**
 * Given a Gregorian Date, return a Gregorian Date representing
 * the FIRST day of the *current Ethiopian month* that contains that day.
 * (00:00 local time of that day.)
 */
export function etMonthStartFromGregorian(g: Date): Date {
  const nowEc = new EtDatetime(g.getTime());
  const { year, month } = nowEc.date as EtDate;
  const firstEc = new EtDatetime(year, month, 1);
  return new Date(firstEc.moment);
}
