"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthioCal = exports.gregorianToEthiopianYMD = exports.ethiopianYMDToGregorian = exports.ethiopianToGregorian = exports.gregorianToEthiopian = exports.jdnToGregorian = exports.gregorianToJDN = exports.ethiopianToJDN = exports.isLeapYear = exports.dayNames = exports.monthNames = void 0;
exports.startOfDay = startOfDay;
exports.endOfDay = endOfDay;
exports.startOfWeekMonday = startOfWeekMonday;
exports.etMonthStart = etMonthStart;
exports.getEthiopianDayName = getEthiopianDayName;
exports.getEthiopianMonthName = getEthiopianMonthName;
exports.formatEthiopianDateWithNames = formatEthiopianDateWithNames;
exports.formatEthiopianDateRangeWithNames = formatEthiopianDateRangeWithNames;
exports.formatSimpleEthiopianDateRange = formatSimpleEthiopianDateRange;
const ETHIOPIC_EPOCH = 1724221;
exports.monthNames = {
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
exports.dayNames = {
    0: 'እሁድ',
    1: 'ሰኞ',
    2: 'ማክሰኞ',
    3: 'ረቡዕ',
    4: 'ሐሙስ',
    5: 'አርብ',
    6: 'ቅዳሜ',
};
const isLeapYear = (year) => year % 4 === 3;
exports.isLeapYear = isLeapYear;
const ethiopianToJDN = (year, month, day) => {
    return (ETHIOPIC_EPOCH +
        (year - 1) * 365 +
        Math.floor(year / 4) +
        (month - 1) * 30 +
        (day - 1));
};
exports.ethiopianToJDN = ethiopianToJDN;
const gregorianToJDN = (date) => {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    return (d +
        Math.floor((153 * m2 + 2) / 5) +
        365 * y2 +
        Math.floor(y2 / 4) -
        Math.floor(y2 / 100) +
        Math.floor(y2 / 400) -
        32045);
};
exports.gregorianToJDN = gregorianToJDN;
const jdnToGregorian = (jdn) => {
    const f = jdn +
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
exports.jdnToGregorian = jdnToGregorian;
function ethiopianNewYearDayInSeptember(ethiopianYear) {
    let day = Math.floor(ethiopianYear / 100) - Math.floor(ethiopianYear / 400) - 4;
    if ((ethiopianYear - 1) % 4 === 3) {
        day += 1;
    }
    return day;
}
const gregorianToEthiopian = (date) => {
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
        const updatedNewYearDate = new Date(Date.UTC(newYearGregYear, 8, newYearDay));
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
exports.gregorianToEthiopian = gregorianToEthiopian;
const ethiopianToGregorian = (year, month, day) => {
    const jdn = (0, exports.ethiopianToJDN)(year, month, day);
    return (0, exports.jdnToGregorian)(jdn);
};
exports.ethiopianToGregorian = ethiopianToGregorian;
const ethiopianYMDToGregorian = (ethStr) => {
    if (!ethStr)
        return '';
    const parts = ethStr.split('-');
    if (parts.length !== 3)
        return '';
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day))
        return '';
    const gcDate = (0, exports.ethiopianToGregorian)(year, month, day);
    const y = gcDate.getUTCFullYear();
    const m = String(gcDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(gcDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};
exports.ethiopianYMDToGregorian = ethiopianYMDToGregorian;
const gregorianToEthiopianYMD = (gcStr) => {
    if (!gcStr)
        return '';
    const parts = gcStr.split('-');
    if (parts.length !== 3)
        return '';
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day))
        return '';
    const eth = (0, exports.gregorianToEthiopian)(new Date(Date.UTC(year, month - 1, day)));
    return `${String(eth.year).padStart(4, '0')}-${String(eth.month).padStart(2, '0')}-${String(eth.day).padStart(2, '0')}`;
};
exports.gregorianToEthiopianYMD = gregorianToEthiopianYMD;
function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function startOfWeekMonday(d) {
    const dt = startOfDay(d);
    const dow = dt.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    dt.setDate(dt.getDate() + diff);
    return dt;
}
function etMonthStart(d) {
    const { year, month } = (0, exports.gregorianToEthiopian)(d);
    return startOfDay((0, exports.ethiopianToGregorian)(year, month, 1));
}
function getEthiopianDayName(date) {
    const ethDate = (0, exports.gregorianToEthiopian)(date);
    const jdn = (0, exports.ethiopianToJDN)(ethDate.year, ethDate.month, ethDate.day);
    const dayOfWeek = (jdn + 2) % 7;
    return exports.dayNames[dayOfWeek];
}
function getEthiopianMonthName(date) {
    const ethDate = (0, exports.gregorianToEthiopian)(date);
    return exports.monthNames[ethDate.month];
}
function formatEthiopianDateWithNames(date) {
    const ethDate = (0, exports.gregorianToEthiopian)(date);
    const dayName = getEthiopianDayName(date);
    const monthName = exports.monthNames[ethDate.month];
    return `${dayName} ${monthName} ${ethDate.day} ${ethDate.year} ዓ.ም`;
}
function formatEthiopianDateRangeWithNames(startDate, endDate) {
    const startEth = (0, exports.gregorianToEthiopian)(startDate);
    const endEth = (0, exports.gregorianToEthiopian)(endDate);
    const startDayName = getEthiopianDayName(startDate);
    const endDayName = getEthiopianDayName(endDate);
    const monthName = exports.monthNames[startEth.month];
    if (startEth.month === endEth.month && startEth.year === endEth.year) {
        return `${startDayName} ${monthName} ${startEth.day}→${endDayName} ${monthName} ${endEth.day} ${endEth.year} ዓ.ም`;
    }
    const endMonthName = exports.monthNames[endEth.month];
    return `${startDayName} ${monthName} ${startEth.day} ${startEth.year}→${endDayName} ${endMonthName} ${endEth.day} ${endEth.year} ዓ.ም`;
}
function formatSimpleEthiopianDateRange(startDate, endDate) {
    const startEth = (0, exports.gregorianToEthiopian)(startDate);
    const endEth = (0, exports.gregorianToEthiopian)(endDate);
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
exports.EthioCal = {
    gregorianToEthiopian: exports.gregorianToEthiopian,
    ethiopianToGregorian: exports.ethiopianToGregorian,
    getEthiopianDayName,
    getEthiopianMonthName,
    formatEthiopianDateWithNames,
    formatEthiopianDateRangeWithNames,
    formatSimpleEthiopianDateRange,
    monthNames: exports.monthNames,
    dayNames: exports.dayNames,
};
//# sourceMappingURL=ethio-period.util.js.map