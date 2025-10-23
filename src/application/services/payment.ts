import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import axios from 'axios';
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
    @Inject(ASSOCIATION_POLICY_REPOSITORY)
    private readonly policy: IAssociationPolicyRepository,
    private readonly prisma: PrismaService,
    private readonly routeService: RouteAssignmentService,
    private readonly smsGateway: SmsGatewayService,
  ) { }

  // ===== Utility: local time helpers =====
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

  // ===== Association fee helper =====
  private async getFees(association_id: number) {
    const p = await this.policy.get(association_id);
    if (!p) throw new BadRequestException('Association policy not configured');
    return {
      weekly_fee: p.weekly_fee,
      monthly_fee: p.monthly_fee,
      daily_rate: p.daily_fine_percent,
    };
  }

  // ===== Payment method helper =====
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
        throw new BadRequestException('Invalid payment_method');
    }
  }

  // ===== Resolve driver =====
  private async resolveDriver(ctx: UserContext, driver_id?: number, plate_number?: string) {
    if (!driver_id && !plate_number) throw new BadRequestException('Provide driver_id or plate_number');

    let d: any = driver_id
      ? await this.drivers.findById(ctx, driver_id)
      : null;

    if (!d && plate_number) {
      const v = await this.prisma.vehicle.findUnique({
        where: { plate_number },
        select: { id: true, association_id: true, driver_id: true },
      });
      if (!v) throw new NotFoundException('Vehicle not found');
      if (!v.driver_id) throw new BadRequestException('No driver assigned to this plate_number');
      d = await this.drivers.findById(ctx, v.driver_id);
    }
    if (!d) throw new NotFoundException('Driver not found');

    if (!isAdminLike(ctx.user_type)) {
      if (!ctx.association_id || d.association_id !== ctx.association_id)
        throw new ForbiddenException('Driver not in your association');
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

  // ===== Manual apply payment (association use) =====
  async applyPayment(ctx: UserContext, dto: PayDto) {
    const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);
    const driverPlan = d.is_weekly ? 'WEEKLY' : 'MONTHLY';
    if (dto.fee_plan !== driverPlan) {
      throw new BadRequestException(`Plan mismatch: driver is ${driverPlan}`);
    }

    const startGc = new Date(dto.covered_start_date);
    const endGc = new Date(dto.covered_end_date);
    if (isNaN(startGc.getTime()) || isNaN(endGc.getTime()))
      throw new BadRequestException('Invalid coverage dates');
    if (startGc > endGc) throw new BadRequestException('Invalid date range');

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

  async initiateChapaPayment(ctx: UserContext, dto: PayDto) {
    const secretKey = process.env.CHAPA_SECRET_KEY!;
    const baseUrl = process.env.CHAPA_BASE_URL!;
    const callbackUrl = process.env.CHAPA_CALLBACK_URL!;
    const tx_ref = `TX-${Date.now()}`;

    const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);
    const [first_name, ...rest] = d.full_name.split(' ');
    const last_name = rest.join(' ') || 'Driver';

    let phone = d.phone_number.trim();
    if (phone.startsWith('+251')) phone = '0' + phone.substring(4);
    else if (phone.startsWith('251')) phone = '0' + phone.substring(3);
    else if (!phone.startsWith('0')) phone = '0' + phone;
    if (!/^0[79]\d{8}$/.test(phone)) {
      throw new BadRequestException(`Invalid phone number format (${d.phone_number}).`);
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

    const response = await axios.post(`${baseUrl}/transaction/initialize`, chapaPayload, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    if (response.data.status !== 'success') {
      throw new BadRequestException(response.data.message || 'Failed to initialize Chapa payment');
    }

    return {
      message: 'Payment initialized successfully',
      tx_ref,
      checkout_url: response.data.data.checkout_url,
    };
  }

  // ✅ Chapa webhook
  async handleChapaCallback(payload: any) {
    console.log('🔔 Received Chapa callback:', JSON.stringify(payload, null, 2));

    const tx_ref = payload.tx_ref || payload.data?.tx_ref;
    if (!tx_ref) throw new BadRequestException('Invalid callback payload');

    const verifyResult = await this.verifyChapaPayment(tx_ref);
    if (verifyResult.status !== 'success') {
      console.log('❌ Chapa verify failed for', tx_ref);
      return { ok: false, message: 'Payment failed or cancelled' };
    }

    const data = verifyResult.data;
    const meta = data.meta ?? {};

    const record = await this.prisma.driverPayment.create({
      data: {
        association_id: 1, // TODO: replace with real association_id if available
        driver_id: meta.driver_id ? Number(meta.driver_id) : null,
        fee_plan: (meta.fee_plan ?? 'MONTHLY') as any,
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

  // ✅ Verify payment (for Flutter)
  async verifyChapaPayment(tx_ref: string) {
    const baseUrl = process.env.CHAPA_BASE_URL!;
    const secretKey = process.env.CHAPA_SECRET_KEY!;
    const res = await axios.get(`${baseUrl}/transaction/verify/${tx_ref}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    return res.data;
  }


  // ===== List and summary =====
  async listPayments(ctx: UserContext, filters: any) {
    if (!isAdminLike(ctx.user_type)) filters.association_id = ctx.association_id;
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

  async totalPayments(ctx: UserContext) {
    if (!ctx.association_id) throw new ForbiddenException('Association context required');
    const totals = await this.payments.getTotalByAssociation(ctx.association_id);
    return { total_amount: totals.total_amount, total_transactions: totals.count };
  }
}
