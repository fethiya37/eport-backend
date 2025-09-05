import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DRIVER_REPOSITORY, type IDriverRepository } from '../../domain/repositories/driver.repository';
import { DRIVER_PAYMENT_REPOSITORY, type IDriverPaymentRepository } from '../../domain/repositories/driver-payment.repository';
import { VEHICLE_ASSIGNMENT_REPOSITORY, type IVehicleAssignmentRepository } from '../../domain/repositories/vehicle-assignment.repository';
import { ASSOCIATION_POLICY_REPOSITORY, type IAssociationPolicyRepository } from '../../domain/repositories/association-policy.repository';
import type { UserContext } from 'src/common/context/user-context';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PayDto } from '../../presentation/payments/dto/pay.dto';
import { startOfDay, startOfWeekMonday, nextWeekMonday, etMonthStart, etNextMonthStart, etMonthEnd } from '../../common/utils/ethio-period.util';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DRIVER_REPOSITORY) private readonly drivers: IDriverRepository,
    @Inject(DRIVER_PAYMENT_REPOSITORY) private readonly payments: IDriverPaymentRepository,
    @Inject(VEHICLE_ASSIGNMENT_REPOSITORY) private readonly vehAssign: IVehicleAssignmentRepository,
    @Inject(ASSOCIATION_POLICY_REPOSITORY) private readonly policy: IAssociationPolicyRepository,
    private readonly prisma: PrismaService,
  ) {}

  private async resolveDriver(ctx: UserContext, driver_id?: number, plate_number?: string) {
    if (!driver_id && !plate_number) {
      throw new BadRequestException('Provide driver_id or plate_number');
    }
    if (driver_id) {
      const d = await this.drivers.findById(ctx, driver_id);
      if (!d) throw new NotFoundException('Driver not found');
      return d;
    }
    // via plate: find active pair
    const v = await this.prisma.vehicle.findUnique({
      where: { plate_number: plate_number! },
      select: { id: true, association_id: true, plate_number: true },
    });
    if (!v) throw new NotFoundException('Vehicle not found');

    const active = await this.prisma.vehicleAssignment.findFirst({
      where: { vehicle_id: v.id, association_id: v.association_id, active: true },
      select: { driver_id: true },
    });
    if (!active) {
      throw new BadRequestException('No active driver–vehicle assignment for the entered plate_number');
    }
    const d = await this.drivers.findById(ctx, active.driver_id);
    if (!d) throw new NotFoundException('Driver not found');
    return d;
  }

  // compute per policy
  private async getFees(association_id: number) {
    const p = await this.policy.get(association_id);
    if (!p) throw new BadRequestException('Association policy not configured');
    return {
      weekly_fee: p.weekly_fee,
      monthly_fee: p.monthly_fee,
      daily_rate: p.daily_fine_percent, // 0.2 = 20% per day
    };
  }

  // coverage math
  private weeklyCoverageFrom(today: Date, prepayQty: number, overdue: boolean) {
    const start = overdue ? startOfWeekMonday(today) : nextWeekMonday(today); // if overdue, current week
    const end = new Date(start);
    end.setDate(end.getDate() + 7 * (1 + prepayQty) - 1); // inclusive end (Sunday of last covered week)
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  private monthlyCoverageFrom(today: Date, prepayQty: number, overdue: boolean) {
    const first = overdue ? etMonthStart(today) : etNextMonthStart(today);
    // last day = end of month N-1 ahead
    let endStart = first;
    for (let i = 0; i < (1 + prepayQty); i++) {
      endStart = etNextMonthStart(endStart);
    }
    const end = new Date(endStart.getTime() - 1); // inclusive end (handles Pagume automatically)
    return { start: first, end };
  }

  async applyPayment(ctx: UserContext, dto: PayDto) {
    const d = await this.resolveDriver(ctx, dto.driver_id, dto.plate_number);
    const prepayQty = Math.max(0, dto.prepay_qty ?? 0);
    const today = startOfDay(new Date());

    const fees = await this.getFees((d as any).association_id);
    const isWeekly = Boolean((d as any).is_weekly);
    const baseFee = isWeekly ? fees.weekly_fee : fees.monthly_fee;

    const activeUntil: Date | null = (d as any).active_until_date ?? null;
    const interestAccrued = Number((d as any).interest_accrued ?? 0);
    const overdue = !activeUntil || startOfDay(activeUntil) < today;

    // Totals
    const currentFee = overdue ? baseFee : 0;      // must pay current if overdue
    const futureFee = prepayQty * baseFee;
    const interest = overdue ? interestAccrued : 0;

    const total = interest + currentFee + futureFee;

    if (dto.total_override !== undefined) {
      const t = Math.round((total + Number.EPSILON) * 100) / 100;
      const o = Math.round((dto.total_override + Number.EPSILON) * 100) / 100;
      if (t !== o) {
        throw new BadRequestException(`Total mismatch. Expected ${t}, got ${o}`);
      }
    }

    // Determine coverage window
    const { start, end } = isWeekly
      ? this.weeklyCoverageFrom(today, prepayQty, overdue)
      : this.monthlyCoverageFrom(today, prepayQty, overdue);

    // Persist: ledger + driver updates (all in txn)
    await this.prisma.$transaction(async (tx) => {
      // ledger
      await this.payments.create({
        association_id: (d as any).association_id,
        driver_id: (d as any).id,
        fee_plan: isWeekly ? 'WEEKLY' : 'MONTHLY',
        prepaid_qty: prepayQty,
        included_interest: interest,
        included_current_fee: overdue ? 1 : 0,
        amount: total,
        covered_start_date: start,
        covered_end_date: end,
        paid_at: new Date(),
        created_by_user_id: ctx.userId,
        plate_number: dto.plate_number ?? null,
      });

      // driver: set active_until_date, zero interest
      await this.drivers.update(ctx, (d as any).id, {
        active_until_date: end,
        interest_accrued: 0,
        last_accrual_amount: 0,
        // if you track payment_status, set it Active here (ignored if not in schema)
      });
    });

    return {
      driver_id: (d as any).id,
      fee_plan: isWeekly ? 'WEEKLY' : 'MONTHLY',
      breakdown: {
        interest,
        current_fee: currentFee,
        future_fee: futureFee,
        total,
      },
      coverage: { from: start, to: end },
    };
  }
}
