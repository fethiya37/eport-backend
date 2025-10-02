"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ymdUTC = ymdUTC;
exports.ymdEATFromInstant = ymdEATFromInstant;
exports.todayYmdEAT = todayYmdEAT;
exports.isDbDateEqualTodayEAT = isDbDateEqualTodayEAT;
exports.isDbDateBeforeTodayEAT = isDbDateBeforeTodayEAT;
const EAT_OFFSET_MIN = 180;
function p2(n) { return n < 10 ? `0${n}` : `${n}`; }
function ymdUTC(d) {
    return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
}
function ymdEATFromInstant(instant) {
    const eatMs = instant.getTime() + EAT_OFFSET_MIN * 60_000;
    const d = new Date(eatMs);
    return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
}
function todayYmdEAT(now = new Date()) {
    return ymdEATFromInstant(now);
}
function isDbDateEqualTodayEAT(dbDate, now = new Date()) {
    if (!dbDate)
        return false;
    const dbYmd = ymdUTC(dbDate);
    const eatYmd = todayYmdEAT(now);
    return dbYmd === eatYmd;
}
function isDbDateBeforeTodayEAT(dbDate, now = new Date()) {
    if (!dbDate)
        return true;
    const dbYmd = ymdUTC(dbDate);
    const eatYmd = todayYmdEAT(now);
    return dbYmd < eatYmd;
}
//# sourceMappingURL=day-local.util.js.map