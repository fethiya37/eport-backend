import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IDriverPaymentRepository,
  DriverPaymentCreate,
} from '../../domain/repositories/driver-payment.repository';
import { DriverPayment, FeePlan, PaymentMethod, Prisma } from '@prisma/client';

@Injectable()
export class PrismaDriverPaymentRepository implements IDriverPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    row: DriverPaymentCreate,
    tx?: Prisma.TransactionClient,
  ): Promise<DriverPayment> {
    const plate = row.plate_number ? row.plate_number.trim() : null;

    const data = {
      association_id: row.association_id,
      driver_id: row.driver_id,
      fee_plan: row.fee_plan as FeePlan,
      prepaid_qty: row.prepaid_qty,
      amount: new Prisma.Decimal(row.amount),
      covered_start_date: row.covered_start_date,
      covered_end_date: row.covered_end_date,
      paid_at: row.paid_at,
      created_by_user_id: row.created_by_user_id,
      payment_method: (row.payment_method ?? null) as PaymentMethod | null,
      plate_number: plate && plate.length ? plate : null,
    };

    if (tx) return tx.driverPayment.create({ data });
    return this.prisma.driverPayment.create({ data });
  }

  private parseDateBound(date: string, endOfDay: boolean) {
    const d = new Date(date + (endOfDay ? 'T23:59:59+03:00' : 'T00:00:00+03:00'));
    if (isNaN(d.getTime())) {
      throw new BadRequestException('Invalid date filter');
    }
    return d;
  }

  async findMany(filters: any): Promise<any[]> {
    return this.prisma.driverPayment.findMany({
      where: {
        ...(filters.association_id && { association_id: Number(filters.association_id) }),
        ...(filters.driver_id && { driver_id: Number(filters.driver_id) }),
        ...(filters.created_by_user_id && { created_by_user_id: Number(filters.created_by_user_id) }),
        ...(filters.fee_plan && { fee_plan: filters.fee_plan }),
        ...(filters.plate_number && { plate_number: String(filters.plate_number).trim() }),
        ...(filters.payment_method && { payment_method: filters.payment_method }),
        ...(filters.from_date && { paid_at: { gte: this.parseDateBound(filters.from_date, false) } }),
        ...(filters.to_date && { paid_at: { lte: this.parseDateBound(filters.to_date, true) } }),
      },
      include: {
        driver: {
          select: {
            full_name: true,
            phone_number: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async getTotalByAssociation(association_id: number): Promise<{ total_amount: number; count: number }> {
    const result = await this.prisma.driverPayment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { association_id },
    });

    return {
      total_amount: Number(result._sum.amount ?? 0),
      count: result._count.id,
    };
  }
}
