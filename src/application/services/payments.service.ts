// src/application/services/payments.service.ts
import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
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
  ) { }

  // ===== date helpers (EAT, UTC+03) =====
  private pad2(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }

  /** Ethiopia local calendar date (UTC+03) in YYYY-MM-DD */
  private ymdEAT(d: Date): string {
    const eatMs = d.getTime() + 3 * 3600_000; // shift +3h
    const eat = new Date(eatMs);
    const y = eat.getUTCFullYear();
    const m = this.pad2(eat.getUTCMonth() + 1);
    const day = this.pad2(eat.getUTCDate());
    return `${y}-${m}-${day}`;
  }

  private todayEatYmd(): string {
    const now = new Date();
    return this.ymdEAT(now);
  }

  private isOverdueEAT(activeUntil?: Date | null): boolean {
    if (!activeUntil) return true;
    const au = this.ymdEAT(activeUntil);
    return au < this.todayEatYmd();
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // ===== policy helper =====
  private async getFees(association_id: number) {
    const p = await this.policy.get(association_id);
    if (!p) throw new BadRequestException('Association policy not configured');
    return {
      weekly_fee: p.weekly_fee,
      monthly_fee: p.monthly_fee,
      daily_rate: p.daily_fine_percent,
    };
  }

  // ===== payment method coercion (string -> Prisma enum) =====
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

  // ===== target resolver (by driver_id or plate_number) with association scoping =====
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
      if (!v.driver_id) {
        throw new BadRequestException('No driver assigned to this plate_number');
      }

      d = await this.drivers.findById(ctx, v.driver_id);
      if (!d) throw new NotFoundException('Driver not found');
    }

    // Association scoping
    if (!isAdminLike(ctx.user_type)) {
      if (!ctx.association_id || d.association_id !== ctx.association_id) {
        throw new ForbiddenException('Target driver not in your association');
      }
    }

    // Attach vehicle info
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

  // ===== main =====
  async applyPayment(ctx: UserContext, dto: PayDto) {
    const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);

    // 1) Plan validation
    const driverPlan = d.is_weekly ? 'WEEKLY' : 'MONTHLY';
    if (dto.fee_plan !== driverPlan) {
      throw new BadRequestException(
        `Plan mismatch: driver is ${driverPlan}, but payload says ${dto.fee_plan}.`,
      );
    }

    // 2) Parse & validate coverage window
    const startGc = new Date(dto.covered_start_date);
    const endGc = new Date(dto.covered_end_date);
    if (isNaN(startGc.getTime()) || isNaN(endGc.getTime())) {
      throw new BadRequestException('covered_start_date/covered_end_date must be valid ISO 8601');
    }
    if (startGc > endGc)
      throw new BadRequestException('covered_start_date must be <= covered_end_date');

    const prepayQty = Math.max(0, dto.prepaid_qty ?? 0);
    const isOverdue = this.isOverdueEAT(d.active_until_date ?? null);

    if (dto.fee_plan === 'WEEKLY') {
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

    // 3) Pricing
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
        throw new BadRequestException(`Total mismatch. Expected ${total}, got ${provided}`);
      }
    }

    // 4) Persist payment + update assignments
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

      // 1️⃣ find latest ACTIVE assignment for this vehicle
      const lastActive = await tx.routeAssignment.findFirst({
        where: { vehicle_id: vehicleId, payment_status: 'ACTIVE' },
        orderBy: { end_date: 'desc' },
      });

      // 2️⃣ bulk-activate eligible assignments in coverage window
      await tx.routeAssignment.updateMany({
        where: {
          vehicle_id: vehicleId,
          payment_status: 'INACTIVE',
          start_date: { gte: lastActive?.end_date ?? new Date(0) },
          end_date: { lte: endGc },
        },
        data: { payment_status: 'ACTIVE' },
      });

      // 3️⃣ extend driver coverage
      await this.drivers.update(ctx, d.id, {
        active_until_date: endGc,
        interest_accrued: 0,
        last_accrual_amount: 0,
        last_accrual_date: null,
      });
    });

    // 5) Fetch new coverage (with routes) and send SMS
    const coverage = await this.routeService.visibleCoverage(ctx, {
      plate_number: dto.plate_number ?? d.vehicle_plate,
    });

    // if (!d.has_smartphone) {
    //   const msg = this.formatCoverageSmsCompact(coverage);
    //   try {
    //     await this.smsGateway.sendSms(d.phone_number, msg);
    //   } catch (err) {
    //     // log but don’t block payment success
    //     console.error('Failed to send SMS', err);
    //   }
    // }

    return {
      payment: {
        plate_number: dto.plate_number ?? d.vehicle_plate ?? null,
        fee_plan: dto.fee_plan,
        breakdown: { interest, current_fee: currentFee, future_fee: futureFee, total },
        coverage: {
          from: this.ymdEAT(startGc), // ✅ now local EAT dates
          to: this.ymdEAT(endGc),
        },
      },
    };
  }

  // ===== Compact SMS formatter =====
  private formatCoverageSmsCompact(data: any): string {
    if (!data.coverage_active) {
      return `Plate: ${data.plate_number} inactive.`;
    }
    const assignments = data.assignments
      .map(
        (a: any) =>
          `${a.route.departure}→${a.route.arrival} (${a.start_date_ec} → ${a.end_date_ec}) [${a.status}]`,
      )
      .join('\n');

    return `Plate: ${data.plate_number}\n${assignments}`;
  }

  // ===== NEW: listPayments with filters =====
  async listPayments(ctx: UserContext, filters: any) {
    if (!isAdminLike(ctx.user_type)) {
      filters.association_id = ctx.association_id;
    }

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
      paid_at: this.ymdEAT(p.paid_at), // ✅ convert to EAT
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
    if (!ctx.association_id) {
      throw new ForbiddenException('Association context required');
    }

    const totals = await this.payments.getTotalByAssociation(ctx.association_id);

    return {
      total_amount: totals.total_amount,
      total_transactions: totals.count,
    };
  }
}
