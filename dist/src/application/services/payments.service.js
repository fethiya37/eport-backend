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
const route_assignment_service_1 = require("./route-assignment.service");
const sms_gateway_service_1 = require("./sms-gateway.service");
const activity_log_service_1 = require("./activity-log.service");
let PaymentsService = class PaymentsService {
    drivers;
    payments;
    policy;
    prisma;
    routeService;
    smsGateway;
    activityLog;
    constructor(drivers, payments, policy, prisma, routeService, smsGateway, activityLog) {
        this.drivers = drivers;
        this.payments = payments;
        this.policy = policy;
        this.prisma = prisma;
        this.routeService = routeService;
        this.smsGateway = smsGateway;
        this.activityLog = activityLog;
    }
    assertPaymentsActor(ctx) {
        if (ctx.user_type !== 'Association' && ctx.user_type !== 'Driver') {
            throw new common_1.ForbiddenException('Not allowed');
        }
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
    toLocalEtMobile(phone) {
        if (!phone)
            return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.startsWith('251'))
            return digits.slice(3);
        return digits;
    }
    assertFeeConfig(p) {
        if (!Number.isFinite(p.weekly_fee) || p.weekly_fee < 0) {
            throw new common_1.BadRequestException('Invalid association policy: weekly_fee');
        }
        if (!Number.isFinite(p.monthly_fee) || p.monthly_fee < 0) {
            throw new common_1.BadRequestException('Invalid association policy: monthly_fee');
        }
        if (!Number.isFinite(p.daily_fine_percent) || p.daily_fine_percent < 0 || p.daily_fine_percent > 1) {
            throw new common_1.BadRequestException('Invalid association policy: daily_fine_percent');
        }
    }
    async getFees(association_id) {
        const p = await this.policy.get(association_id);
        if (!p)
            throw new common_1.BadRequestException('Association policy not configured');
        this.assertFeeConfig({
            weekly_fee: Number(p.weekly_fee),
            monthly_fee: Number(p.monthly_fee),
            daily_fine_percent: Number(p.daily_fine_percent),
        });
        return {
            weekly_fee: Number(p.weekly_fee),
            monthly_fee: Number(p.monthly_fee),
            daily_rate: Number(p.daily_fine_percent),
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
    coercePaymentMethodLiteral(value) {
        const v = (value ?? 'MOBILE').trim().toUpperCase();
        if (v === 'CASH' || v === 'BANK' || v === 'MOBILE' || v === 'OTHER')
            return v;
        throw new common_1.BadRequestException('Invalid payment_method. Use one of: CASH | BANK | MOBILE | OTHER');
    }
    normalizePlate(plate) {
        const p = (plate ?? '').trim();
        return p.length ? p : undefined;
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
            const plate = this.normalizePlate(plate_number);
            if (!plate)
                throw new common_1.BadRequestException('Invalid plate_number');
            const v = await this.prisma.vehicle.findUnique({
                where: { plate_number: plate },
                select: { id: true, association_id: true, driver_id: true },
            });
            if (!v)
                throw new common_1.NotFoundException('Vehicle not found');
            if (!v.driver_id)
                throw new common_1.BadRequestException('No driver assigned to this plate_number');
            d = await this.drivers.findById(ctx, v.driver_id);
            if (!d)
                throw new common_1.NotFoundException('Driver not found');
        }
        if (ctx.user_type === 'Association') {
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
    assertPlanMatches(driverIsWeekly, feePlan) {
        const driverPlan = driverIsWeekly ? 'WEEKLY' : 'MONTHLY';
        if (feePlan !== driverPlan) {
            throw new common_1.BadRequestException(`Plan mismatch: driver is ${driverPlan}, but payload says ${feePlan}.`);
        }
    }
    assertWeeklyWindow(startGc, endGc, isOverdue, prepayQty) {
        const days = Math.floor(this.startOfDay(endGc).getTime() - this.startOfDay(startGc).getTime()) /
            86_400_000 +
            1;
        const expectedWeeks = isOverdue ? 1 + prepayQty : Math.max(1, prepayQty);
        if (days % 7 !== 0 || days / 7 !== expectedWeeks) {
            throw new common_1.BadRequestException(`Weekly coverage length must equal ${expectedWeeks} week(s) = ${expectedWeeks * 7} days.`);
        }
    }
    parseAndValidateWindow(feePlan, start, end, isOverdue, prepayQty) {
        const startGc = new Date(start);
        const endGc = new Date(end);
        if (isNaN(startGc.getTime()) || isNaN(endGc.getTime())) {
            throw new common_1.BadRequestException('covered_start_date/covered_end_date must be valid ISO 8601');
        }
        if (startGc > endGc) {
            throw new common_1.BadRequestException('covered_start_date must be <= covered_end_date');
        }
        if (feePlan === 'WEEKLY') {
            this.assertWeeklyWindow(startGc, endGc, isOverdue, prepayQty);
        }
        return { startGc, endGc };
    }
    computeTotal(feePlan, isOverdue, prepayQty, baseFee, interestAccrued) {
        const interestSafe = Number.isFinite(interestAccrued) ? Math.max(0, interestAccrued) : 0;
        const current = isOverdue ? baseFee : 0;
        const interest = isOverdue ? interestSafe : 0;
        const future = prepayQty * baseFee;
        return Math.round((current + interest + future + Number.EPSILON) * 100) / 100;
    }
    splitName(fullName) {
        const parts = (fullName ?? 'Driver User').trim().split(/\s+/);
        const firstName = parts[0] || 'Driver';
        const lastName = parts.slice(1).join(' ') || 'User';
        return { firstName, lastName };
    }
    async applyPayment(ctx, dto) {
        this.assertPaymentsActor(ctx);
        const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);
        this.assertPlanMatches(d.is_weekly, dto.fee_plan);
        const prepayQty = Math.max(0, dto.prepaid_qty ?? 0);
        const isOverdue = this.isOverdueEAT(d.active_until_date ?? null);
        const { startGc, endGc } = this.parseAndValidateWindow(dto.fee_plan, dto.covered_start_date, dto.covered_end_date, isOverdue, prepayQty);
        const fees = await this.getFees(d.association_id);
        const baseFee = dto.fee_plan === 'WEEKLY' ? fees.weekly_fee : fees.monthly_fee;
        if (!Number.isFinite(baseFee) || baseFee < 0) {
            throw new common_1.BadRequestException('Invalid fee configuration');
        }
        const total = this.computeTotal(dto.fee_plan, isOverdue, prepayQty, baseFee, Number(d.interest_accrued ?? 0));
        if (!Number.isFinite(total) || total < 0) {
            throw new common_1.BadRequestException('Invalid computed total');
        }
        if (dto.amount !== undefined) {
            const provided = Math.round((dto.amount + Number.EPSILON) * 100) / 100;
            if (provided !== total) {
                throw new common_1.BadRequestException(`Total mismatch. Expected ${total}, got ${provided}`);
            }
        }
        const createdPayment = await this.prisma.$transaction(async (tx) => {
            const payment = await this.payments.create({
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
                plate_number: this.normalizePlate(dto.plate_number) ?? d.vehicle_plate ?? null,
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
            return payment;
        });
        await this.activityLog.log(ctx, {
            module: 'Payments',
            action: 'APPLY',
            entity: 'DriverPayment',
            entity_id: createdPayment.id,
        });
        const coverage = await this.routeService.visibleCoverage(ctx, {
            plate_number: this.normalizePlate(dto.plate_number) ?? d.vehicle_plate,
        });
        if (!d.has_smartphone) {
            const msg = this.formatCoverageSmsCompact(coverage);
            try {
                await this.smsGateway.sendSms(this.toLocalEtMobile(d.phone_number), msg);
            }
            catch (e) { }
        }
        return {
            payment: {
                plate_number: this.normalizePlate(dto.plate_number) ?? d.vehicle_plate ?? null,
                fee_plan: dto.fee_plan,
                breakdown: {
                    interest: isOverdue ? Math.max(0, Number(d.interest_accrued ?? 0)) : 0,
                    current_fee: isOverdue ? baseFee : 0,
                    future_fee: prepayQty * baseFee,
                    total,
                },
                coverage: { from: this.ymdEAT(startGc), to: this.ymdEAT(endGc) },
            },
        };
    }
    formatCoverageSmsCompact(data) {
        if (!data.coverage_active)
            return `Plate: ${data.plate_number} inactive.`;
        const assignments = data.assignments
            .map((a) => `${a.route.departure}→${a.route.arrival} (${a.start_date_ec} → ${a.end_date_ec}) [${a.status}]`)
            .join('\n');
        return `Plate: ${data.plate_number}\n${assignments}`;
    }
    async listPayments(ctx, filters) {
        this.assertPaymentsActor(ctx);
        if (ctx.user_type !== 'Association') {
            throw new common_1.ForbiddenException('Not allowed');
        }
        filters.association_id = ctx.association_id;
        const rows = await this.payments.findMany(filters);
        return rows.map((p) => ({
            id: p.id,
            association_id: p.association_id,
            driver_id: p.driver_id,
            plate_number: p.plate_number,
            fee_plan: p.fee_plan,
            prepaid_qty: p.prepaid_qty,
            amount: Number(p.amount),
            payment_method: p.payment_method,
            covered_start_date: this.ymdEAT(p.covered_start_date),
            covered_end_date: this.ymdEAT(p.covered_end_date),
            paid_at: this.ymdEAT(p.paid_at),
            driver: p.driver
                ? {
                    full_name: p.driver.full_name,
                    phone_number: p.driver.phone_number,
                    username: p.driver.user?.name,
                }
                : null,
        }));
    }
    async totalPayments(ctx) {
        this.assertPaymentsActor(ctx);
        if (ctx.user_type !== 'Association') {
            throw new common_1.ForbiddenException('Not allowed');
        }
        if (!ctx.association_id)
            throw new common_1.ForbiddenException('Association context required');
        const totals = await this.payments.getTotalByAssociation(ctx.association_id);
        return { total_amount: totals.total_amount, total_transactions: totals.count };
    }
    buildTxRefOnline(p) {
        const yymmdd = (d) => d.replace(/-/g, '').slice(2, 8);
        const rand = Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(2, 10);
        const plan = p.fee_plan === 'MONTHLY' ? 'M' : 'W';
        const q = Math.max(0, p.prepaid_qty ?? 0);
        const mMap = { CASH: 'c', BANK: 'b', MOBILE: 'm', OTHER: 'o' };
        const m = (p.payment_method ?? 'MOBILE').toUpperCase();
        const mSeg = m === 'MOBILE' ? '' : `-m${mMap[m] ?? 'm'}`;
        const cents = Math.round((p.amount + Number.EPSILON) * 100);
        const v = cents.toString(36);
        const qSeg = q > 0 ? `-q${q}` : '';
        const tx = [
            `A${p.association_id}`,
            `D${p.driver_id}`,
            `P${plan}`,
            `S${yymmdd(p.covered_start_date)}`,
            `E${yymmdd(p.covered_end_date)}`,
        ].join('-') + `${qSeg}${mSeg}-v${v}-r${rand}`;
        if (tx.length > 50) {
            const over = tx.length - 50;
            const newRandLen = Math.max(4, 8 - over);
            const shortRand = rand.slice(0, newRandLen);
            return tx.replace(/-r[0-9a-z]+$/i, `-r${shortRand}`);
        }
        return tx;
    }
    parseTxRefOnline(txRef) {
        const parts = txRef.split('-');
        const getVal = (k) => parts.find((s) => s.startsWith(k))?.slice(1) ?? '';
        const aid = Number(getVal('A'));
        const did = Number(getVal('D'));
        const planChar = getVal('P');
        const s = getVal('S');
        const e = getVal('E');
        const q = getVal('q');
        const m = getVal('m');
        const v = getVal('v');
        const toYmd = (yymmdd) => `20${yymmdd.slice(0, 2)}-${yymmdd.slice(2, 4)}-${yymmdd.slice(4, 6)}`;
        const mRev = {
            c: 'CASH',
            b: 'BANK',
            m: 'MOBILE',
            o: 'OTHER',
        };
        const method = m ? (mRev[m] ?? 'MOBILE') : 'MOBILE';
        const cents = v ? parseInt(v, 36) : 0;
        const amount = Math.round((cents / 100 + Number.EPSILON) * 100) / 100;
        return {
            association_id: aid,
            driver_id: did,
            fee_plan: planChar === 'M' ? 'MONTHLY' : 'WEEKLY',
            covered_start_date: toYmd(s),
            covered_end_date: toYmd(e),
            prepaid_qty: q ? Number(q) : 0,
            payment_method: method,
            amount,
        };
    }
    async initOnlineFromPayDto(ctx, dto) {
        this.assertPaymentsActor(ctx);
        if (ctx.user_type !== 'Driver')
            throw new common_1.ForbiddenException('Not allowed');
        const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);
        this.assertPlanMatches(d.is_weekly, dto.fee_plan);
        const prepayQty = Math.max(0, dto.prepaid_qty ?? 0);
        const isOverdue = this.isOverdueEAT(d.active_until_date ?? null);
        this.parseAndValidateWindow(dto.fee_plan, dto.covered_start_date, dto.covered_end_date, isOverdue, prepayQty);
        const fees = await this.getFees(d.association_id);
        const baseFee = dto.fee_plan === 'WEEKLY' ? fees.weekly_fee : fees.monthly_fee;
        const total = this.computeTotal(dto.fee_plan, isOverdue, prepayQty, baseFee, Number(d.interest_accrued ?? 0));
        const assocSub = await this.prisma.associationSubaccount.findUnique({
            where: { association_id: d.association_id },
            select: { chapa_id: true },
        });
        if (!assocSub?.chapa_id) {
            throw new common_1.BadRequestException('Association has no Chapa subaccount configured');
        }
        const txRef = this.buildTxRefOnline({
            association_id: d.association_id,
            driver_id: d.id,
            fee_plan: dto.fee_plan,
            prepaid_qty: prepayQty,
            covered_start_date: dto.covered_start_date,
            covered_end_date: dto.covered_end_date,
            payment_method: this.coercePaymentMethodLiteral(dto.payment_method),
            amount: total,
        });
        const CHAPA_SECRET = process.env.CHAPA_SECRET;
        const BASE_URL = process.env.BASE_URL;
        const { firstName, lastName } = this.splitName(d.full_name);
        const phoneLocal = this.toLocalEtMobile(d.phone_number);
        const payload = {
            amount: String(total),
            currency: 'ETB',
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneLocal,
            tx_ref: txRef,
            callback_url: `${BASE_URL}/payments/callback`,
            return_url: `${BASE_URL}/payments/online/return`,
            'customization[title]': 'MembershipFee',
            'customization[description]': 'Driver membership payment',
            subaccounts: {
                id: assocSub.chapa_id,
            },
        };
        const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${CHAPA_SECRET}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const chapa = await res.json();
        if (!res.ok)
            throw new common_1.BadRequestException(chapa);
        await this.activityLog.log(ctx, {
            module: 'Payments',
            action: 'INIT_ONLINE',
            entity: 'Driver',
            entity_id: d.id,
        });
        return {
            tx_ref: txRef,
            amount: total,
            checkout_url: chapa?.data?.checkout_url ?? null,
            chapa_id: assocSub.chapa_id,
            chapa,
        };
    }
    async recordAfterChapaSuccess(txRef) {
        const verify = await this.verify(txRef);
        const ok = verify?.status === 'success' && verify?.data?.status === 'success';
        if (!ok) {
            return { recorded: false, status: verify?.data?.status ?? 'pending' };
        }
        const parsed = this.parseTxRefOnline(txRef);
        const driver = await this.prisma.driver.findUnique({
            where: { id: parsed.driver_id },
            select: {
                id: true,
                user_id: true,
                association_id: true,
                active_until_date: true,
                interest_accrued: true,
            },
        });
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        const fees = await this.getFees(driver.association_id);
        const baseFee = parsed.fee_plan === 'WEEKLY' ? fees.weekly_fee : fees.monthly_fee;
        const isOverdue = this.isOverdueEAT(driver.active_until_date ?? null);
        const prepayQty = Math.max(0, parsed.prepaid_qty ?? 0);
        const expected = this.computeTotal(parsed.fee_plan, isOverdue, prepayQty, baseFee, Number(driver.interest_accrued ?? 0));
        const paid = Number(verify.data.amount);
        if (paid !== expected) {
            await this.activityLog.log({
                userId: driver.user_id,
                user_type: 'Driver',
                association_id: driver.association_id,
            }, {
                module: 'Payments',
                action: 'ONLINE_MISMATCH',
                entity: 'Driver',
                entity_id: driver.id,
            });
            return { recorded: false, status: 'mismatch', expected, paid, tx_ref: txRef };
        }
        const ctx = {
            userId: driver.user_id,
            user_type: 'Driver',
            association_id: driver.association_id,
        };
        await this.applyPayment(ctx, {
            driver_id: driver.id,
            fee_plan: parsed.fee_plan,
            prepaid_qty: parsed.prepaid_qty,
            covered_start_date: parsed.covered_start_date,
            covered_end_date: parsed.covered_end_date,
            payment_method: parsed.payment_method,
        });
        await this.activityLog.log(ctx, {
            module: 'Payments',
            action: 'ONLINE_SUCCESS',
            entity: 'Driver',
            entity_id: driver.id,
        });
        const ref_id = verify?.data?.reference || verify?.data?.ref_id || null;
        return { recorded: true, status: 'success', ref_id, tx_ref: txRef };
    }
    async verify(txRef) {
        const CHAPA_SECRET = process.env.CHAPA_SECRET;
        const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
            headers: { Authorization: `Bearer ${CHAPA_SECRET}` },
        });
        const data = await res.json();
        if (!res.ok)
            throw new common_1.HttpException(data, res.status);
        return data;
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
        sms_gateway_service_1.SmsGatewayService,
        activity_log_service_1.ActivityLogService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map