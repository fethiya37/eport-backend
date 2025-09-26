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
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
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
  private pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }
  private ymdUTC(d: Date) { return d.toISOString().slice(0, 10); }
  private todayEatYmd(): string {
    const now = new Date();
    const eatMs = now.getTime() + 3 * 3600_000;
    const eat = new Date(eatMs);
    return `${eat.getUTCFullYear()}-${this.pad2(eat.getUTCMonth() + 1)}-${this.pad2(eat.getUTCDate())}`;
  }
  private isOverdueEAT(activeUntil?: Date | null): boolean {
    if (!activeUntil) return true;
    const au = this.ymdUTC(activeUntil);
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
      case 'CARD':
      case 'BANK':
      case 'MOBILE':
      case 'OTHER':
        return v as PaymentMethod;
      default:
        throw new BadRequestException(
          'Invalid payment_method. Use one of: CASH | CARD | BANK | MOBILE | OTHER',
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

    return d;
  }

  // ===== main =====
  async applyPayment(ctx: UserContext, dto: PayDto) {
    const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);

    // 1) Plan validation
    const driverWeekly = Boolean((d as any).is_weekly);
    if (dto.is_weekly !== driverWeekly) {
      throw new BadRequestException(
        `Plan mismatch: driver is ${driverWeekly ? 'WEEKLY' : 'MONTHLY'}, but payload says ${dto.is_weekly ? 'WEEKLY' : 'MONTHLY'}.`,
      );
    }

    // 2) Parse & validate coverage window
    const startGc = new Date(dto.covered_start_date);
    const endGc = new Date(dto.covered_end_date);
    if (isNaN(startGc.getTime()) || isNaN(endGc.getTime())) {
      throw new BadRequestException('covered_start_date/covered_end_date must be valid ISO 8601');
    }
    if (startGc > endGc) throw new BadRequestException('covered_start_date must be <= covered_end_date');

    const prepayQty = Math.max(0, dto.prepay_qty ?? 0);
    if (dto.is_weekly) {
      const days =
        Math.floor(this.startOfDay(endGc).getTime() - this.startOfDay(startGc).getTime()) /
        86_400_000 +
        1;
      const expectedWeeks = 1 + prepayQty;
      if (days % 7 !== 0 || days / 7 !== expectedWeeks) {
        throw new BadRequestException('Weekly coverage length must equal 7 * (1 + prepay_qty) days.');
      }
    }

    // 3) Pricing
    const fees = await this.getFees((d as any).association_id);
    const baseFee = dto.is_weekly ? fees.weekly_fee : fees.monthly_fee;

    const isOverdue = this.isOverdueEAT((d as any).active_until_date ?? null);
    const interestAccrued = Number((d as any).interest_accrued ?? 0);

    const currentFee = isOverdue ? baseFee : 0;
    const interest = isOverdue ? interestAccrued : 0;
    const futureFee = prepayQty * baseFee;

    const total = Math.round((currentFee + interest + futureFee + Number.EPSILON) * 100) / 100;

    if (dto.total_override !== undefined) {
      const provided = Math.round((dto.total_override + Number.EPSILON) * 100) / 100;
      if (provided !== total) {
        throw new BadRequestException(`Total mismatch. Expected ${total}, got ${provided}`);
      }
    }

    // 4) Persist payment + update assignments instead of driver.payment_status
    await this.prisma.$transaction(async (tx) => {
      await this.payments.create(
        {
          association_id: (d as any).association_id,
          driver_id: (d as any).id,
          fee_plan: dto.is_weekly ? 'WEEKLY' : 'MONTHLY',
          prepaid_qty: prepayQty,
          amount: total,
          covered_start_date: startGc,
          covered_end_date: endGc,
          paid_at: new Date(),
          created_by_user_id: ctx.userId,
          payment_method: this.parsePaymentMethod(dto.payment_method),
        },
        tx,
      );

      // ✅ update route assignments payment_status
      const vehicleId = (d as any).vehicle_id;
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

      // 3️⃣ still extend driver.active_until_date for coverage logic
      await this.drivers.update(ctx, (d as any).id, {
        active_until_date: endGc,
        interest_accrued: 0,
        last_accrual_amount: 0,
        last_accrual_date: null,
      });
    });

    // 5) Fetch new coverage (with routes) and send SMS
    const coverage = await this.routeService.visibleCoverage(ctx, { plate_number: dto.plate_number! });

    // const msg = this.formatCoverageSmsCompact(coverage);
    // await this.smsGateway.sendSms((d as any).phone_number, msg);

    return {
      payment: {
        driver_id: (d as any).id,
        fee_plan: dto.is_weekly ? 'WEEKLY' : 'MONTHLY',
        breakdown: { interest, current_fee: currentFee, future_fee: futureFee, total },
        coverage: { from: startGc.toISOString(), to: endGc.toISOString() },
      },
      coverage,
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
}
