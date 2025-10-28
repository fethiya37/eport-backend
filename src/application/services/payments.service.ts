import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import {
  DRIVER_REPOSITORY,
  type IDriverRepository,
} from '../../domain/repositories/driver.repository';
import {
  DRIVER_PAYMENT_REPOSITORY,
  type IDriverPaymentRepository,
} from '../../domain/repositories/driver-payment.repository';
import {
  ASSOCIATION_POLICY_REPOSITORY,
  type IAssociationPolicyRepository,
} from '../../domain/repositories/association-policy.repository';
import type { UserContext } from 'src/common/context/user-context';
import { PrismaService } from '../../../prisma/prisma.service';
import { PayDto } from '../../presentation/payments/dto/pay.dto';
import { isAdminLike } from '../../common/auth/roles.util';
import { PaymentMethod } from '@prisma/client';
import { RouteAssignmentService } from './route-assignment.service';
import { SmsGatewayService } from './sms-gateway.service';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DRIVER_REPOSITORY) private readonly drivers: IDriverRepository,
    @Inject(DRIVER_PAYMENT_REPOSITORY) private readonly payments: IDriverPaymentRepository,
    @Inject(ASSOCIATION_POLICY_REPOSITORY) private readonly policy: IAssociationPolicyRepository,
    private readonly prisma: PrismaService,
    private readonly routeService: RouteAssignmentService,
    private readonly smsGateway: SmsGatewayService,
  ) {}

  // ===== utils =====
  private pad2(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }
  private ymdEAT(d: Date): string {
    const eatMs = d.getTime() + 3 * 3600_000;
    const eat = new Date(eatMs);
    const y = eat.getUTCFullYear();
    const m = this.pad2(eat.getUTCMonth() + 1);
    const day = this.pad2(eat.getUTCDate());
    return `${y}-${m}-${day}`;
  }
  private todayEatYmd(): string {
    return this.ymdEAT(new Date());
  }
  private isOverdueEAT(activeUntil?: Date | null): boolean {
    if (!activeUntil) return true;
    return this.ymdEAT(activeUntil) < this.todayEatYmd();
  }
  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // Phone: normalize to Ethiopian local mobile format 09/07xxxxxxxx
  private toLocalEtMobile(phone?: string): string {
    const fallback = '0912345678';
    if (!phone) return fallback;
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('251')) {
      const rest = digits.slice(3);
      if (rest.startsWith('9') || rest.startsWith('7')) return `0${rest}`;
      return fallback;
    }
    if ((digits.startsWith('09') || digits.startsWith('07')) && digits.length >= 10) {
      return digits.slice(0, 10);
    }
    if ((digits.startsWith('9') || digits.startsWith('7')) && digits.length >= 9) {
      return `0${digits.slice(0, 9)}`;
    }
    return fallback;
  }

  private async getFees(association_id: number) {
    const p = await this.policy.get(association_id);
    if (!p) throw new BadRequestException('Association policy not configured');
    return {
      weekly_fee: p.weekly_fee,
      monthly_fee: p.monthly_fee,
      daily_rate: p.daily_fine_percent,
    };
  }

  // For saving into DB (Prisma enum)
  private parsePaymentMethod(value?: string): PaymentMethod | null {
    if (!value) return null;
    const v = value.trim().toUpperCase();
    switch (v) {
      case 'CASH':
      case 'BANK':
      case 'MOBILE':
      case 'OTHER':
        return v as PaymentMethod;
      default:
        throw new BadRequestException(
          'Invalid payment_method. Use one of: CASH | BANK | MOBILE | OTHER',
        );
    }
  }

  // For tx_ref builder (string-literal union)
  private coercePaymentMethodLiteral(
    value?: string,
  ): 'CASH' | 'BANK' | 'MOBILE' | 'OTHER' {
    const v = (value ?? 'MOBILE').trim().toUpperCase();
    if (v === 'CASH' || v === 'BANK' || v === 'MOBILE' || v === 'OTHER') return v;
    throw new BadRequestException(
      'Invalid payment_method. Use one of: CASH | BANK | MOBILE | OTHER',
    );
  }

  private async resolveDriver(ctx: UserContext, driver_id?: number, plate_number?: string) {
    if (!driver_id && !plate_number) {
      throw new BadRequestException('Provide driver_id or plate_number');
    }

    let d: any = null;
    if (driver_id) {
      d = await this.drivers.findById(ctx, driver_id);
      if (!d) throw new NotFoundException('Driver not found');
    } else {
      const v = await this.prisma.vehicle.findUnique({
        where: { plate_number: plate_number! },
        select: { id: true, association_id: true, driver_id: true },
      });
      if (!v) throw new NotFoundException('Vehicle not found');
      if (!v.driver_id) throw new BadRequestException('No driver assigned to this plate_number');
      d = await this.drivers.findById(ctx, v.driver_id);
      if (!d) throw new NotFoundException('Driver not found');
    }

    if (!isAdminLike(ctx.user_type)) {
      if (!ctx.association_id || d.association_id !== ctx.association_id) {
        throw new ForbiddenException('Target driver not in your association');
      }
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { driver_id: d.id },
      select: { id: true, plate_number: true, is_weekly: true },
    });
    if (!vehicle) throw new BadRequestException('Driver has no assigned vehicle');

    d.vehicle_id = vehicle.id;
    d.vehicle_plate = vehicle.plate_number;
    d.is_weekly = vehicle.is_weekly;
    return d;
  }

  // ===== shared validators / calculators =====
  private assertPlanMatches(driverIsWeekly: boolean, feePlan: 'WEEKLY' | 'MONTHLY') {
    const driverPlan = driverIsWeekly ? 'WEEKLY' : 'MONTHLY';
    if (feePlan !== driverPlan) {
      throw new BadRequestException(
        `Plan mismatch: driver is ${driverPlan}, but payload says ${feePlan}.`,
      );
    }
  }

  private assertWeeklyWindow(
    startGc: Date,
    endGc: Date,
    isOverdue: boolean,
    prepayQty: number,
  ) {
    const days =
      Math.floor(this.startOfDay(endGc).getTime() - this.startOfDay(startGc).getTime()) /
        86_400_000 +
      1;
    const expectedWeeks = isOverdue ? 1 + prepayQty : Math.max(1, prepayQty);
    if (days % 7 !== 0 || days / 7 !== expectedWeeks) {
      throw new BadRequestException(
        `Weekly coverage length must equal ${expectedWeeks} week(s) = ${expectedWeeks * 7} days.`,
      );
    }
  }

  private parseAndValidateWindow(
    feePlan: 'WEEKLY' | 'MONTHLY',
    start: string,
    end: string,
    isOverdue: boolean,
    prepayQty: number,
  ) {
    const startGc = new Date(start);
    const endGc = new Date(end);
    if (isNaN(startGc.getTime()) || isNaN(endGc.getTime())) {
      throw new BadRequestException(
        'covered_start_date/covered_end_date must be valid ISO 8601',
      );
    }
    if (startGc > endGc)
      throw new BadRequestException(
        'covered_start_date must be <= covered_end_date',
      );
    if (feePlan === 'WEEKLY') {
      this.assertWeeklyWindow(startGc, endGc, isOverdue, prepayQty);
    }
    return { startGc, endGc };
  }

  private computeTotal(
    feePlan: 'WEEKLY' | 'MONTHLY',
    isOverdue: boolean,
    prepayQty: number,
    baseFee: number,
    interestAccrued: number,
  ) {
    const current = isOverdue ? baseFee : 0;
    const interest = isOverdue ? interestAccrued : 0;
    const future = prepayQty * baseFee;
    return Math.round((current + interest + future + Number.EPSILON) * 100) / 100;
  }

  private splitName(fullName?: string) {
    const parts = (fullName ?? 'Driver User').trim().split(/\s+/);
    const firstName = parts[0] || 'Driver';
    const lastName = parts.slice(1).join(' ') || 'User';
    return { firstName, lastName };
  }

  // ===== main =====
  async applyPayment(ctx: UserContext, dto: PayDto) {
    const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);

    this.assertPlanMatches(d.is_weekly, dto.fee_plan);

    const prepayQty = Math.max(0, dto.prepaid_qty ?? 0);
    const isOverdue = this.isOverdueEAT(d.active_until_date ?? null);
    const { startGc, endGc } = this.parseAndValidateWindow(
      dto.fee_plan,
      dto.covered_start_date,
      dto.covered_end_date,
      isOverdue,
      prepayQty,
    );

    const fees = await this.getFees(d.association_id);
    const baseFee = dto.fee_plan === 'WEEKLY' ? fees.weekly_fee : fees.monthly_fee;
    const total = this.computeTotal(
      dto.fee_plan,
      isOverdue,
      prepayQty,
      baseFee,
      Number(d.interest_accrued ?? 0),
    );

    if (dto.amount !== undefined) {
      const provided = Math.round((dto.amount + Number.EPSILON) * 100) / 100;
      if (provided !== total)
        throw new BadRequestException(`Total mismatch. Expected ${total}, got ${provided}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await this.payments.create(
        {
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
        tx,
      );

      const vehicleId = d.vehicle_id;
      if (!vehicleId) throw new BadRequestException('Driver has no assigned vehicle');

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

    if (!d.has_smartphone) {
      const msg = this.formatCoverageSmsCompact(coverage);
      try {
        await this.smsGateway.sendSms(this.toLocalEtMobile(d.phone_number), msg);
      } catch (err) {
        console.error('Failed to send SMS', err);
      }
    }

    return {
      payment: {
        plate_number: dto.plate_number ?? d.vehicle_plate ?? null,
        fee_plan: dto.fee_plan,
        breakdown: {
          interest: isOverdue ? Number(d.interest_accrued ?? 0) : 0,
          current_fee: isOverdue ? baseFee : 0,
          future_fee: prepayQty * baseFee,
          total,
        },
        coverage: { from: this.ymdEAT(startGc), to: this.ymdEAT(endGc) },
      },
    };
  }

  private formatCoverageSmsCompact(data: any): string {
    if (!data.coverage_active) return `Plate: ${data.plate_number} inactive.`;
    const assignments = data.assignments
      .map(
        (a: any) =>
          `${a.route.departure}→${a.route.arrival} (${a.start_date_ec} → ${a.end_date_ec}) [${a.status}]`,
      )
      .join('\n');
    return `Plate: ${data.plate_number}\n${assignments}`;
  }

  async listPayments(ctx: UserContext, filters: any) {
    if (!isAdminLike(ctx.user_type)) filters.association_id = ctx.association_id;
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

  async totalPayments(ctx: UserContext) {
    if (!ctx.association_id) throw new ForbiddenException('Association context required');
    const totals = await this.payments.getTotalByAssociation(ctx.association_id);
    return { total_amount: totals.total_amount, total_transactions: totals.count };
  }

  private buildTxRefOnline(p: {
    association_id: number;
    driver_id: number;
    fee_plan: 'WEEKLY' | 'MONTHLY';
    covered_start_date: string;
    covered_end_date: string;
    prepaid_qty?: number;
    payment_method?: 'CASH' | 'BANK' | 'MOBILE' | 'OTHER';
    amount: number;
  }) {
    const yymmdd = (d: string) => d.replace(/-/g, '').slice(2, 8);
    const rand = Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(2, 10);
    const plan = p.fee_plan === 'MONTHLY' ? 'M' : 'W';
    const q = Math.max(0, p.prepaid_qty ?? 0);
    const mMap: Record<string, string> = { CASH: 'c', BANK: 'b', MOBILE: 'm', OTHER: 'o' };
    const m = (p.payment_method ?? 'MOBILE').toUpperCase();
    const mSeg = m === 'MOBILE' ? '' : `-m${mMap[m] ?? 'm'}`;
    const cents = Math.round((p.amount + Number.EPSILON) * 100);
    const v = cents.toString(36);
    const qSeg = q > 0 ? `-q${q}` : '';
    const tx =
      [
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

  private parseTxRefOnline(txRef: string) {
    const parts = txRef.split('-');
    const getVal = (k: string) => parts.find((s) => s.startsWith(k))?.slice(1) ?? '';
    const aid = Number(getVal('A'));
    const did = Number(getVal('D'));
    const planChar = getVal('P');
    const s = getVal('S');
    const e = getVal('E');
    const q = getVal('q');
    const m = getVal('m');
    const v = getVal('v');
    const toYmd = (yymmdd: string) =>
      `20${yymmdd.slice(0, 2)}-${yymmdd.slice(2, 4)}-${yymmdd.slice(4, 6)}`;
    const mRev: Record<string, 'CASH' | 'BANK' | 'MOBILE' | 'OTHER'> = {
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
      fee_plan: planChar === 'M' ? ('MONTHLY' as const) : ('WEEKLY' as const),
      covered_start_date: toYmd(s),
      covered_end_date: toYmd(e),
      prepaid_qty: q ? Number(q) : 0,
      payment_method: method,
      amount,
    };
  }

  // === Initialize Hosted Checkout using PayDto & driver data ===
 // src/application/services/payments.service.ts

async initOnlineFromPayDto(ctx: UserContext, dto: PayDto) {
  const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);

  this.assertPlanMatches(d.is_weekly, dto.fee_plan);

  const prepayQty = Math.max(0, dto.prepaid_qty ?? 0);
  const isOverdue = this.isOverdueEAT(d.active_until_date ?? null);
  this.parseAndValidateWindow(
    dto.fee_plan,
    dto.covered_start_date,
    dto.covered_end_date,
    isOverdue,
    prepayQty,
  );

  const fees = await this.getFees(d.association_id);
  const baseFee = dto.fee_plan === 'WEEKLY' ? fees.weekly_fee : fees.monthly_fee;
  const total = this.computeTotal(
    dto.fee_plan,
    isOverdue,
    prepayQty,
    baseFee,
    Number(d.interest_accrued ?? 0),
  );

  // 🔎 Fetch the association's Chapa subaccount (required for direct settlement)
  const assocSub = await this.prisma.associationSubaccount.findUnique({
    where: { association_id: d.association_id },
    select: {
      association_id: true,
      chapa_id: true,      
      business_name: true,
      account_name: true,
      account_number: true,
    },
  });

  if (!assocSub?.chapa_id) {
    // Fail fast so driver cannot proceed without a destination
    throw new BadRequestException(
      'This association has no Chapa subaccount configured. Please contact the association admin.'
    );
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

  const CHAPA_SECRET = process.env.CHAPA_SECRET!;
  const BASE_URL = process.env.BASE_URL!;

  const { firstName, lastName } = this.splitName(d.full_name);
  const phoneLocal = this.toLocalEtMobile(d.phone_number);

  // 🧾 Initialize Hosted Checkout AT THE ASSOCIATION'S SUBACCOUNT
  // If Chapa's field is named "chapa_id", swap the key below.
  const payload: Record<string, any> = {
    amount: String(total),
    currency: 'ETB',
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneLocal,
    tx_ref: txRef,
    callback_url: `${BASE_URL}/payments/callback`,
    return_url: `${BASE_URL}/payments/online/return`,
    customization: {
      title: 'MembershipFee',
      description: 'Driver membership payment',
    },
    subaccount: assocSub.chapa_id, // << direct settlement to association
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
  if (!res.ok) throw new BadRequestException(chapa);

  const checkout_url = chapa?.data?.checkout_url ?? null;

  return {
    tx_ref: txRef,
    amount: total,
    checkout_url,
    chapa_id: assocSub.chapa_id, // helpful for client debug/telemetry
    chapa,
  };
}


  // === Callback: verify & record as the DRIVER ===
  async recordAfterChapaSuccess(txRef: string) {
    const verify = await this.verify(txRef);
    const ok = verify?.status === 'success' && verify?.data?.status === 'success';
    if (!ok) return { recorded: false, status: verify?.data?.status ?? 'pending' };

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
    if (!driver) throw new NotFoundException('Driver not found');

    const fees = await this.getFees(driver.association_id);
    const baseFee =
      parsed.fee_plan === 'WEEKLY' ? fees.weekly_fee : fees.monthly_fee;
    const isOverdue = this.isOverdueEAT(driver.active_until_date ?? null);
    const prepayQty = Math.max(0, parsed.prepaid_qty ?? 0);
    const expected = this.computeTotal(
      parsed.fee_plan,
      isOverdue,
      prepayQty,
      baseFee,
      Number(driver.interest_accrued ?? 0),
    );

    const paid = Number(verify.data.amount);
    if (paid !== expected) {
      return { recorded: false, status: 'mismatch', expected, paid, tx_ref: txRef };
    }

    const ctx: UserContext = {
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
    } as PayDto);

    const ref_id = verify?.data?.reference || verify?.data?.ref_id || null;
    return { recorded: true, status: 'success', ref_id, tx_ref: txRef };
  }

  async verify(txRef: string) {
    const CHAPA_SECRET = process.env.CHAPA_SECRET!;
    const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
      headers: { Authorization: `Bearer ${CHAPA_SECRET}` },
    });
    const data = await res.json();
    if (!res.ok) throw new HttpException(data, res.status);
    return data;
  }
}
