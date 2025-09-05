import { EtDatetime } from 'abushakir';

// helpers: start of local day
export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

// Monday-start week (Gregorian)
export function startOfWeekMonday(d: Date): Date {
  const dt = startOfDay(d);
  const dow = dt.getDay();              // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + diff);
  return dt;
}
export function nextWeekMonday(d: Date): Date {
  const s = startOfWeekMonday(d);
  s.setDate(s.getDate() + 7);
  return s;
}

// Ethiopian month start (GC)
export function etMonthStart(d: Date): Date {
  const ec = new EtDatetime(d.getTime());             // EC for given GC
  const first = new EtDatetime(ec.year, ec.month, 1); // EC first day
  return new Date(first.moment);
}
// first day of next Ethiopian month (GC)
export function etNextMonthStart(d: Date): Date {
  const ec = new EtDatetime(d.getTime());
  const y = ec.month === 13 ? ec.year + 1 : ec.year;
  const m = ec.month === 13 ? 1 : ec.month + 1;
  const firstNext = new EtDatetime(y, m, 1);
  return new Date(firstNext.moment);
}
// Ethiopian month end (GC) = next month start - 1 ms
export function etMonthEnd(d: Date): Date {
  const next = etNextMonthStart(d);
  return new Date(next.getTime() - 1);
}

// Detect "first day of EC month" for boundary jobs
export function isFirstDayOfEthiopianMonth(d: Date): boolean {
  const s = etMonthStart(d);
  return startOfDay(s).getTime() === startOfDay(d).getTime();
}
