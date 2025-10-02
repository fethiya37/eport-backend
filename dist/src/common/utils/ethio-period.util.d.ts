export declare function startOfDay(d: Date): Date;
export declare function endOfDay(d: Date): Date;
export declare function startOfWeekMonday(d: Date): Date;
declare function ecFromGc(g: Date): {
    year: number;
    month: number;
    day: number;
};
declare function gcFromEc(y: number, m: number, d: number): Date;
export declare function etMonthStart(d: Date): Date;
export declare function isFirstDayOfEthiopianMonth(d: Date): boolean;
export declare const EthioCal: {
    ecFromGc: typeof ecFromGc;
    gcFromEc: typeof gcFromEc;
};
export {};
