
const ETHIOPIC_EPOCH = 1724221;

export const monthNames: Record<number, string> = {
  1: 'መስከረም',
  2: 'ጥቅምት',
  3: 'ኅዳር',
  4: 'ታኅሣሥ',
  5: 'ጥር',
  6: 'የካቲት',
  7: 'መጋቢት',
  8: 'ሚያዝያ',
  9: 'ግንቦት',
  10: 'ሰኔ',
  11: 'ሐምሌ',
  12: 'ነሐሴ',
  13: 'ጳጉሜ',
};

export const dayNames: Record<number, string> = {
  0: 'እሁድ',
  1: 'ሰኞ',
  2: 'ማክሰኞ',
  3: 'ረቡዕ',
  4: 'ሐሙስ',
  5: 'አርብ',
  6: 'ቅዳሜ',
};

export const isLeapYear = (year: number): boolean => year % 4 === 3;

export const ethiopianToJDN = (
  year: number,
  month: number,
  day: number,
): number => {
  return (
    ETHIOPIC_EPOCH +
    (year - 1) * 365 +
    Math.floor(year / 4) +
    (month - 1) * 30 +
    (day - 1)
  );
};

export const gregorianToJDN = (date: Date): number => {
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
};

export const jdnToGregorian = (jdn: number): Date => {
  const f =
    jdn +
    1401 +
    Math.floor((Math.floor((4 * jdn + 274277) / 146097) * 3) / 4) -
    38;
  const e = 4 * f + 3;
  const g = Math.floor((e % 1461) / 4);
  const h = 5 * g + 2;
  const day = Math.floor((h % 153) / 5) + 1;
  const month = ((Math.floor(h / 153) + 2) % 12) + 1;
  const year = Math.floor(e / 1461) - 4716 + Math.floor((14 - month) / 12);
  return new Date(Date.UTC(year, month - 1, day));
};

function ethiopianNewYearDayInSeptember(ethiopianYear: number): number {
  let day =
    Math.floor(ethiopianYear / 100) - Math.floor(ethiopianYear / 400) - 4;
  if ((ethiopianYear - 1) % 4 === 3) {
    day += 1;
  }
  return day;
}

export const gregorianToEthiopian = (
  date: Date,
): { year: number; month: number; day: number } => {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();

  if (y < 1900) {
    throw new Error('Gregorian year must be 1900 or later.');
  }

  let ethYear = y - 7;
  let newYearDay = ethiopianNewYearDayInSeptember(ethYear);
  let newYearGregYear = ethYear + 7;
  const newYearDate = new Date(Date.UTC(newYearGregYear, 8, newYearDay));

  const currentDate = new Date(Date.UTC(y, m - 1, d));

  if (currentDate < newYearDate) {
    ethYear--;
    newYearDay = ethiopianNewYearDayInSeptember(ethYear);
    newYearGregYear = ethYear + 7;
    const updatedNewYearDate = new Date(
      Date.UTC(newYearGregYear, 8, newYearDay),
    );
    const diffTime = currentDate.getTime() - updatedNewYearDate.getTime();
    const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let month = Math.floor(daysDiff / 30) + 1;
    let day = (daysDiff % 30) + 1;

    if (month > 13) {
      month = 13;
      day = daysDiff - 360 + 1;
    }

    return {
      year: ethYear,
      month: month,
      day: day,
    };
  }

  const diffTime = currentDate.getTime() - newYearDate.getTime();
  const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let month = Math.floor(daysDiff / 30) + 1;
  let day = (daysDiff % 30) + 1;

  if (month > 13) {
    month = 13;
    day = daysDiff - 360 + 1;
  }

  return {
    year: ethYear,
    month: month,
    day: day,
  };
};

export const ethiopianToGregorian = (
  year: number,
  month: number,
  day: number,
): Date => {
  const jdn = ethiopianToJDN(year, month, day);
  return jdnToGregorian(jdn);
};

export const ethiopianYMDToGregorian = (ethStr: string): string => {
  if (!ethStr) return '';
  const parts = ethStr.split('-');
  if (parts.length !== 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

  const gcDate = ethiopianToGregorian(year, month, day);
  const y = gcDate.getUTCFullYear();
  const m = String(gcDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(gcDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const gregorianToEthiopianYMD = (gcStr: string): string => {
  if (!gcStr) return '';
  const parts = gcStr.split('-');
  if (parts.length !== 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

  const eth = gregorianToEthiopian(new Date(Date.UTC(year, month - 1, day)));
  return `${String(eth.year).padStart(4, '0')}-${String(eth.month).padStart(2, '0')}-${String(eth.day).padStart(2, '0')}`;
};

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function startOfWeekMonday(d: Date): Date {
  const dt = startOfDay(d);
  const dow = dt.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + diff);
  return dt;
}

export function etMonthStart(d: Date): Date {
  const { year, month } = gregorianToEthiopian(d);
  return startOfDay(ethiopianToGregorian(year, month, 1));
}

export function getEthiopianDayName(date: Date): string {
  const ethDate = gregorianToEthiopian(date);
  const jdn = ethiopianToJDN(ethDate.year, ethDate.month, ethDate.day);
  const dayOfWeek = (jdn + 2) % 7;
  return dayNames[dayOfWeek];
}

export function getEthiopianMonthName(date: Date): string {
  const ethDate = gregorianToEthiopian(date);
  return monthNames[ethDate.month];
}

export function formatEthiopianDateWithNames(date: Date): string {
  const ethDate = gregorianToEthiopian(date);
  const dayName = getEthiopianDayName(date);
  const monthName = monthNames[ethDate.month];
  return `${dayName} ${monthName} ${ethDate.day} ${ethDate.year} ዓ.ም`;
}

export function formatEthiopianDateRangeWithNames(
  startDate: Date,
  endDate: Date,
): string {
  const startEth = gregorianToEthiopian(startDate);
  const endEth = gregorianToEthiopian(endDate);

  const startDayName = getEthiopianDayName(startDate);
  const endDayName = getEthiopianDayName(endDate);
  const monthName = monthNames[startEth.month];

  if (startEth.month === endEth.month && startEth.year === endEth.year) {
    return `${startDayName} ${monthName} ${startEth.day}→${endDayName} ${monthName} ${endEth.day} ${endEth.year} ዓ.ም`;
  }

  const endMonthName = monthNames[endEth.month];
  return `${startDayName} ${monthName} ${startEth.day} ${startEth.year}→${endDayName} ${endMonthName} ${endEth.day} ${endEth.year} ዓ.ም`;
}

export function formatSimpleEthiopianDateRange(
  startDate: Date,
  endDate: Date,
): string {
  const startEth = gregorianToEthiopian(startDate);
  const endEth = gregorianToEthiopian(endDate);

  const startDay = String(startEth.day).padStart(2, '0');
  const endDay = String(endEth.day).padStart(2, '0');
  const startMonth = String(startEth.month).padStart(2, '0');
  const endMonth = String(endEth.month).padStart(2, '0');
  const startYear = String(startEth.year).slice(-2);
  const endYear = String(endEth.year).slice(-2);

  if (startEth.month === endEth.month && startEth.year === endEth.year) {
    return `${startDay}-${endDay}/${startMonth}/${startYear} ዓ.ም`;
  }

  if (startEth.year === endEth.year) {
    return `${startDay}/${startMonth}-${endDay}/${endMonth}/${startYear} ዓ.ም`;
  }

  return `${startDay}/${startMonth}/${startYear}-${endDay}/${endMonth}/${endYear} ዓ.ም`;
}

export const EthioCal = {
  gregorianToEthiopian,
  ethiopianToGregorian,
  getEthiopianDayName,
  getEthiopianMonthName,
  formatEthiopianDateWithNames,
  formatEthiopianDateRangeWithNames,
  formatSimpleEthiopianDateRange,
  monthNames,
  dayNames,
};
