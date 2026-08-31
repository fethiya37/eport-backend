export declare const monthNames: Record<number, string>;
export declare const dayNames: Record<number, string>;
export declare const isLeapYear: (year: number) => boolean;
export declare const ethiopianToJDN: (year: number, month: number, day: number) => number;
export declare const gregorianToJDN: (date: Date) => number;
export declare const jdnToGregorian: (jdn: number) => Date;
export declare const gregorianToEthiopian: (date: Date) => {
    year: number;
    month: number;
    day: number;
};
export declare const ethiopianToGregorian: (year: number, month: number, day: number) => Date;
export declare const ethiopianYMDToGregorian: (ethStr: string) => string;
export declare const gregorianToEthiopianYMD: (gcStr: string) => string;
export declare function startOfDay(d: Date): Date;
export declare function endOfDay(d: Date): Date;
export declare function startOfWeekMonday(d: Date): Date;
export declare function etMonthStart(d: Date): Date;
export declare function getEthiopianDayName(date: Date): string;
export declare function getEthiopianMonthName(date: Date): string;
export declare function formatEthiopianDateWithNames(date: Date): string;
export declare function formatEthiopianDateRangeWithNames(startDate: Date, endDate: Date): string;
export declare function formatSimpleEthiopianDateRange(startDate: Date, endDate: Date): string;
export declare const EthioCal: {
    gregorianToEthiopian: (date: Date) => {
        year: number;
        month: number;
        day: number;
    };
    ethiopianToGregorian: (year: number, month: number, day: number) => Date;
    getEthiopianDayName: typeof getEthiopianDayName;
    getEthiopianMonthName: typeof getEthiopianMonthName;
    formatEthiopianDateWithNames: typeof formatEthiopianDateWithNames;
    formatEthiopianDateRangeWithNames: typeof formatEthiopianDateRangeWithNames;
    formatSimpleEthiopianDateRange: typeof formatSimpleEthiopianDateRange;
    monthNames: Record<number, string>;
    dayNames: Record<number, string>;
};
