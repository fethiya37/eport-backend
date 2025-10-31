"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BillingJobs_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingJobs = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
function pad2(n) {
    return n < 10 ? `0${n}` : `${n}`;
}
function eatYmdNow() {
    const now = new Date();
    const eatMs = now.getTime() + 3 * 3600_000;
    const d = new Date(eatMs);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}
function ymdToUtcDate(ymd) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}
function ymdUTC(d) {
    if (!d)
        return null;
    return d.toISOString().slice(0, 10);
}
function isOverdueEat(activeUntil, todayEatYmd) {
    const today = todayEatYmd ?? eatYmdNow();
    const au = activeUntil ? ymdUTC(activeUntil) : null;
    return !au || au < today;
}
let BillingJobs = BillingJobs_1 = class BillingJobs {
    prisma;
    logger = new common_1.Logger(BillingJobs_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dailyFine() {
        const todayEat = eatYmdNow();
        const todayEatDateUtc = ymdToUtcDate(todayEat);
        const vehicles = await this.prisma.vehicle.findMany({
            where: {
                status: { in: [client_1.VehicleStatus.ACTIVE, client_1.VehicleStatus.INACTIVE] },
                driver_id: { not: null },
            },
            select: {
                id: true,
                association_id: true,
                is_weekly: true,
                driver: {
                    select: {
                        id: true,
                        active_until_date: true,
                        interest_accrued: true,
                    },
                },
            },
        });
        for (const v of vehicles) {
            if (!v.driver)
                continue;
            if (!isOverdueEat(v.driver.active_until_date, todayEat))
                continue;
            let weeklyFee = 0, monthlyFee = 0, rate = 0;
            try {
                const rows = await this.prisma.$queryRawUnsafe(`SELECT weekly_fee, monthly_fee, daily_fine_percent
           FROM association_policies
           WHERE association_id = $1
           LIMIT 1`, v.association_id);
                if (rows?.[0]) {
                    weeklyFee = Number(rows[0].weekly_fee ?? 0) || 0;
                    monthlyFee = Number(rows[0].monthly_fee ?? 0) || 0;
                    rate = Number(rows[0].daily_fine_percent ?? 0) || 0;
                }
            }
            catch {
            }
            const base = v.is_weekly ? weeklyFee : monthlyFee;
            const add = Math.round((base * rate + Number.EPSILON) * 100) / 100;
            if (add <= 0)
                continue;
            await this.prisma.driver.update({
                where: { id: v.driver.id },
                data: {
                    interest_accrued: (Number(v.driver.interest_accrued ?? 0) + add),
                    last_accrual_date: todayEatDateUtc,
                    last_accrual_amount: add,
                },
            });
        }
        this.logger.log(`[dailyFine] done for EAT ${todayEat}`);
    }
};
exports.BillingJobs = BillingJobs;
__decorate([
    (0, schedule_1.Cron)('5 0 * * *', { timeZone: 'Africa/Addis_Ababa' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingJobs.prototype, "dailyFine", null);
exports.BillingJobs = BillingJobs = BillingJobs_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingJobs);
//# sourceMappingURL=billing.jobs.js.map