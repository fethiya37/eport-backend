"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gcToEthiopian = gcToEthiopian;
const ethiopian_date_1 = require("ethiopian-date");
function gcToEthiopian(date) {
    if (!date)
        return '';
    const [year, month, day] = (0, ethiopian_date_1.toEthiopian)(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    return `${year}-${month.toString().padStart(2, '0')}-${day
        .toString()
        .padStart(2, '0')}`;
}
//# sourceMappingURL=ethio-date.util.js.map