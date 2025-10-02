"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateParam = parseDateParam;
const common_1 = require("@nestjs/common");
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
function parseDateParam(input, bound) {
    if (!input)
        return undefined;
    if (DATE_ONLY.test(input)) {
        const suffix = bound === 'from' ? 'T00:00:00.000+03:00' : 'T23:59:59.999+03:00';
        const d = new Date(`${input}${suffix}`);
        if (isNaN(d.getTime()))
            throw new common_1.BadRequestException(`Invalid ${bound} date: ${input}`);
        return d;
    }
    const d = new Date(input);
    if (isNaN(d.getTime()))
        throw new common_1.BadRequestException(`Invalid date: ${input}`);
    return d;
}
//# sourceMappingURL=date-range.util.js.map