// Replace with a real converter (e.g. a library). For now assume already Gregorian YYYY-MM-DD.
export function etDateToGregorian(dateStr: string): Date {
  // TODO: implement conversion from Ethiopian calendar to Gregorian
  // Accepts 'YYYY-MM-DD' (Ethiopian) and returns a JS Date (Gregorian).
  return new Date(dateStr + 'T00:00:00Z');
}
