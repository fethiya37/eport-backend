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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const driver_repository_1 = require("../../domain/repositories/driver.repository");
const driver_payment_repository_1 = require("../../domain/repositories/driver-payment.repository");
const association_policy_repository_1 = require("../../domain/repositories/association-policy.repository");
const prisma_service_1 = require("../../../prisma/prisma.service");
const roles_util_1 = require("../../common/auth/roles.util");
const route_assignment_service_1 = require("./route-assignment.service");
const sms_gateway_service_1 = require("./sms-gateway.service");
let PaymentsService = class PaymentsService {
    drivers;
    payments;
    policy;
    prisma;
    routeService;
    smsGateway;
    constructor(drivers, payments, policy, prisma, routeService, smsGateway) {
        this.drivers = drivers;
        this.payments = payments;
        this.policy = policy;
        this.prisma = prisma;
        this.routeService = routeService;
        this.smsGateway = smsGateway;
    }
    pad2(n) {
        return n < 10 ? `0${n}` : `${n}`;
    }
    ymdEAT(d) {
        const eatMs = d.getTime() + 3 * 3600_000;
        const eat = new Date(eatMs);
        const y = eat.getUTCFullYear();
        const m = this.pad2(eat.getUTCMonth() + 1);
        const day = this.pad2(eat.getUTCDate());
        return `${y}-${m}-${day}`;
    }
    todayEatYmd() {
        const now = new Date();
        return this.ymdEAT(now);
    }
    isOverdueEAT(activeUntil) {
        if (!activeUntil)
            return true;
        const au = this.ymdEAT(activeUntil);
        return au < this.todayEatYmd();
    }
    startOfDay(d) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    async getFees(association_id) {
        const p = await this.policy.get(association_id);
        if (!p)
            throw new common_1.BadRequestException('Association policy not configured');
        return {
            weekly_fee: p.weekly_fee,
            monthly_fee: p.monthly_fee,
            daily_rate: p.daily_fine_percent,
        };
    }
    parsePaymentMethod(value) {
        if (!value)
            return null;
        const v = value.trim().toUpperCase();
        switch (v) {
            case 'CASH':
            case 'BANK':
            case 'MOBILE':
            case 'OTHER':
                return v;
            default:
                throw new common_1.BadRequestException('Invalid payment_method. Use one of: CASH | BANK | MOBILE | OTHER');
        }
    }
    async resolveDriver(ctx, driver_id, plate_number) {
        if (!driver_id && !plate_number) {
            throw new common_1.BadRequestException('Provide driver_id or plate_number');
        }
        let d = null;
        if (driver_id) {
            d = await this.drivers.findById(ctx, driver_id);
            if (!d)
                throw new common_1.NotFoundException('Driver not found');
        }
        else {
            const v = await this.prisma.vehicle.findUnique({
                where: { plate_number: plate_number },
                select: { id: true, association_id: true, driver_id: true },
            });
            if (!v)
                throw new common_1.NotFoundException('Vehicle not found');
            if (!v.driver_id) {
                throw new common_1.BadRequestException('No driver assigned to this plate_number');
            }
            d = await this.drivers.findById(ctx, v.driver_id);
            if (!d)
                throw new common_1.NotFoundException('Driver not found');
        }
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type)) {
            if (!ctx.association_id || d.association_id !== ctx.association_id) {
                throw new common_1.ForbiddenException('Target driver not in your association');
            }
        }
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { driver_id: d.id },
            select: { id: true, plate_number: true, is_weekly: true },
        });
        if (!vehicle)
            throw new common_1.BadRequestException('Driver has no assigned vehicle');
        d.vehicle_id = vehicle.id;
        d.vehicle_plate = vehicle.plate_number;
        d.is_weekly = vehicle.is_weekly;
        return d;
    }
    async applyPayment(ctx, dto) {
        const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);
        const driverPlan = d.is_weekly ? 'WEEKLY' : 'MONTHLY';
        if (dto.fee_plan !== driverPlan) {
            throw new common_1.BadRequestException(`Plan mismatch: driver is ${driverPlan}, but payload says ${dto.fee_plan}.`);
        }
        const startGc = new Date(dto.covered_start_date);
        const endGc = new Date(dto.covered_end_date);
        if (isNaN(startGc.getTime()) || isNaN(endGc.getTime())) {
            throw new common_1.BadRequestException('covered_start_date/covered_end_date must be valid ISO 8601');
        }
        if (startGc > endGc)
            throw new common_1.BadRequestException('covered_start_date must be <= covered_end_date');
        const prepayQty = Math.max(0, dto.prepaid_qty ?? 0);
        const isOverdue = this.isOverdueEAT(d.active_until_date ?? null);
        if (dto.fee_plan === 'WEEKLY') {
            const days = Math.floor(this.startOfDay(endGc).getTime() - this.startOfDay(startGc).getTime()) /
                86_400_000 +
                1;
            const expectedWeeks = isOverdue ? 1 + prepayQty : Math.max(1, prepayQty);
            if (days % 7 !== 0 || days / 7 !== expectedWeeks) {
                throw new common_1.BadRequestException(`Weekly coverage length must equal ${expectedWeeks} week(s) = ${expectedWeeks * 7} days.`);
            }
        }
        const fees = await this.getFees(d.association_id);
        const baseFee = dto.fee_plan === 'WEEKLY' ? fees.weekly_fee : fees.monthly_fee;
        const interestAccrued = Number(d.interest_accrued ?? 0);
        const currentFee = isOverdue ? baseFee : 0;
        const interest = isOverdue ? interestAccrued : 0;
        const futureFee = prepayQty * baseFee;
        const total = Math.round((currentFee + interest + futureFee + Number.EPSILON) * 100) / 100;
        if (dto.amount !== undefined) {
            const provided = Math.round((dto.amount + Number.EPSILON) * 100) / 100;
            if (provided !== total) {
                throw new common_1.BadRequestException(`Total mismatch. Expected ${total}, got ${provided}`);
            }
        }
        await this.prisma.$transaction(async (tx) => {
            await this.payments.create({
                association_id: d.association_id,
                driver_id: d.id,
                fee_plan: dto.fee_plan,
                prepaid_qty: prepayQty,
                amount: total,
                covered_start_date: startGc,
                covered_end_date: endGc,
                paid_at: new Date(),
                created_by_user_id: ctx.userId,
                payment_method: this.parsePaymentMethod(dto.payment_method),
                plate_number: dto.plate_number ?? d.vehicle_plate ?? null,
            }, tx);
            const vehicleId = d.vehicle_id;
            if (!vehicleId)
                throw new common_1.BadRequestException('Driver has no assigned vehicle');
            const lastActive = await tx.routeAssignment.findFirst({
                where: { vehicle_id: vehicleId, payment_status: 'ACTIVE' },
                orderBy: { end_date: 'desc' },
            });
            await tx.routeAssignment.updateMany({
                where: {
                    vehicle_id: vehicleId,
                    payment_status: 'INACTIVE',
                    start_date: { gte: lastActive?.end_date ?? new Date(0) },
                    end_date: { lte: endGc },
                },
                data: { payment_status: 'ACTIVE' },
            });
            await this.drivers.update(ctx, d.id, {
                active_until_date: endGc,
                interest_accrued: 0,
                last_accrual_amount: 0,
                last_accrual_date: null,
            });
        });
        const coverage = await this.routeService.visibleCoverage(ctx, {
            plate_number: dto.plate_number ?? d.vehicle_plate,
        });
        return {
            payment: {
                plate_number: dto.plate_number ?? d.vehicle_plate ?? null,
                fee_plan: dto.fee_plan,
                breakdown: { interest, current_fee: currentFee, future_fee: futureFee, total },
                coverage: {
                    from: this.ymdEAT(startGc),
                    to: this.ymdEAT(endGc),
                },
            },
        };
    }
    formatCoverageSmsCompact(data) {
        if (!data.coverage_active) {
            return `Plate: ${data.plate_number} inactive.`;
        }
        const assignments = data.assignments
            .map((a) => `${a.route.departure}→${a.route.arrival} (${a.start_date_ec} → ${a.end_date_ec}) [${a.status}]`)
            .join('\n');
        return `Plate: ${data.plate_number}\n${assignments}`;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(driver_repository_1.DRIVER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(driver_payment_repository_1.DRIVER_PAYMENT_REPOSITORY)),
    __param(2, (0, common_1.Inject)(association_policy_repository_1.ASSOCIATION_POLICY_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, prisma_service_1.PrismaService,
        route_assignment_service_1.RouteAssignmentService,
        sms_gateway_service_1.SmsGatewayService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map