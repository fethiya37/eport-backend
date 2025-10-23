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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
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
        return this.ymdEAT(new Date());
    }
    isOverdueEAT(activeUntil) {
        if (!activeUntil)
            return true;
        return this.ymdEAT(activeUntil) < this.todayEatYmd();
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
                throw new common_1.BadRequestException('Invalid payment_method');
        }
    }
    async resolveDriver(ctx, driver_id, plate_number) {
        if (!driver_id && !plate_number)
            throw new common_1.BadRequestException('Provide driver_id or plate_number');
        let d = driver_id
            ? await this.drivers.findById(ctx, driver_id)
            : null;
        if (!d && plate_number) {
            const v = await this.prisma.vehicle.findUnique({
                where: { plate_number },
                select: { id: true, association_id: true, driver_id: true },
            });
            if (!v)
                throw new common_1.NotFoundException('Vehicle not found');
            if (!v.driver_id)
                throw new common_1.BadRequestException('No driver assigned to this plate_number');
            d = await this.drivers.findById(ctx, v.driver_id);
        }
        if (!d)
            throw new common_1.NotFoundException('Driver not found');
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type)) {
            if (!ctx.association_id || d.association_id !== ctx.association_id)
                throw new common_1.ForbiddenException('Driver not in your association');
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
            throw new common_1.BadRequestException(`Plan mismatch: driver is ${driverPlan}`);
        }
        const startGc = new Date(dto.covered_start_date);
        const endGc = new Date(dto.covered_end_date);
        if (isNaN(startGc.getTime()) || isNaN(endGc.getTime()))
            throw new common_1.BadRequestException('Invalid coverage dates');
        if (startGc > endGc)
            throw new common_1.BadRequestException('Invalid date range');
        const prepayQty = Math.max(0, dto.prepaid_qty ?? 0);
        const isOverdue = this.isOverdueEAT(d.active_until_date ?? null);
        const fees = await this.getFees(d.association_id);
        const baseFee = dto.fee_plan === 'WEEKLY' ? fees.weekly_fee : fees.monthly_fee;
        const interestAccrued = Number(d.interest_accrued ?? 0);
        const currentFee = isOverdue ? baseFee : 0;
        const interest = isOverdue ? interestAccrued : 0;
        const futureFee = prepayQty * baseFee;
        const total = Math.round((currentFee + interest + futureFee) * 100) / 100;
        await this.prisma.driverPayment.create({
            data: {
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
            },
        });
        return { message: 'Manual payment recorded successfully.' };
    }
    async initiateChapaPayment(ctx, dto) {
        const secretKey = process.env.CHAPA_SECRET_KEY;
        const baseUrl = process.env.CHAPA_BASE_URL;
        const callbackUrl = process.env.CHAPA_CALLBACK_URL;
        const tx_ref = `TX-${Date.now()}`;
        const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);
        const [first_name, ...rest] = d.full_name.split(' ');
        const last_name = rest.join(' ') || 'Driver';
        let phone = d.phone_number.trim();
        if (phone.startsWith('+251'))
            phone = '0' + phone.substring(4);
        else if (phone.startsWith('251'))
            phone = '0' + phone.substring(3);
        else if (!phone.startsWith('0'))
            phone = '0' + phone;
        if (!/^0[79]\d{8}$/.test(phone)) {
            throw new common_1.BadRequestException(`Invalid phone number format (${d.phone_number}).`);
        }
        const chapaPayload = {
            amount: dto.amount ?? 0,
            currency: 'ETB',
            first_name,
            last_name,
            phone_number: phone,
            tx_ref,
            callback_url: callbackUrl,
            customization: {
                title: 'E-Port Pay',
                description: 'Driver membership fee',
            },
            meta: {
                plate_number: dto.plate_number ?? d.vehicle_plate,
                driver_id: d.id,
                fee_plan: dto.fee_plan,
                covered_start_date: dto.covered_start_date,
                covered_end_date: dto.covered_end_date,
            },
        };
        const response = await axios_1.default.post(`${baseUrl}/transaction/initialize`, chapaPayload, {
            headers: { Authorization: `Bearer ${secretKey}` },
        });
        if (response.data.status !== 'success') {
            throw new common_1.BadRequestException(response.data.message || 'Failed to initialize Chapa payment');
        }
        return {
            message: 'Payment initialized successfully',
            tx_ref,
            checkout_url: response.data.data.checkout_url,
        };
    }
    async handleChapaCallback(payload) {
        console.log('🔔 Received Chapa callback:', JSON.stringify(payload, null, 2));
        const tx_ref = payload.tx_ref || payload.data?.tx_ref;
        if (!tx_ref)
            throw new common_1.BadRequestException('Invalid callback payload');
        const verifyResult = await this.verifyChapaPayment(tx_ref);
        if (verifyResult.status !== 'success') {
            console.log('❌ Chapa verify failed for', tx_ref);
            return { ok: false, message: 'Payment failed or cancelled' };
        }
        const data = verifyResult.data;
        const meta = data.meta ?? {};
        const record = await this.prisma.driverPayment.create({
            data: {
                association_id: 1,
                driver_id: meta.driver_id ? Number(meta.driver_id) : null,
                fee_plan: (meta.fee_plan ?? 'MONTHLY'),
                prepaid_qty: 0,
                amount: parseFloat(data.amount ?? 0),
                covered_start_date: new Date(meta.covered_start_date ?? new Date()),
                covered_end_date: new Date(meta.covered_end_date ?? new Date()),
                paid_at: new Date(),
                payment_method: 'MOBILE',
                plate_number: meta.plate_number ?? null,
            },
        });
        console.log('✅ Payment recorded for tx_ref:', tx_ref);
        return { ok: true, message: 'Payment confirmed and recorded successfully', tx_ref, record };
    }
    async verifyChapaPayment(tx_ref) {
        const baseUrl = process.env.CHAPA_BASE_URL;
        const secretKey = process.env.CHAPA_SECRET_KEY;
        const res = await axios_1.default.get(`${baseUrl}/transaction/verify/${tx_ref}`, {
            headers: { Authorization: `Bearer ${secretKey}` },
        });
        return res.data;
    }
    async listPayments(ctx, filters) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            filters.association_id = ctx.association_id;
        const rows = await this.payments.findMany(filters);
        return rows.map((p) => ({
            id: p.id,
            plate_number: p.plate_number,
            fee_plan: p.fee_plan,
            prepaid_qty: p.prepaid_qty,
            amount: Number(p.amount),
            payment_method: p.payment_method,
            covered_start_date: this.ymdEAT(p.covered_start_date),
            covered_end_date: this.ymdEAT(p.covered_end_date),
            paid_at: this.ymdEAT(p.paid_at),
        }));
    }
    async totalPayments(ctx) {
        if (!ctx.association_id)
            throw new common_1.ForbiddenException('Association context required');
        const totals = await this.payments.getTotalByAssociation(ctx.association_id);
        return { total_amount: totals.total_amount, total_transactions: totals.count };
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
//# sourceMappingURL=payment.js.map