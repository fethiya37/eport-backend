// src/infrastructure/repositories/prisma-driver-payment.repository.ts
import { Injectable } from '@nestjs/common';
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
      plate_number: row.plate_number ?? null,
    };

    if (tx) return tx.driverPayment.create({ data });
    return this.prisma.driverPayment.create({ data });
  }

  async findMany(filters: any): Promise<any[]> {
    return this.prisma.driverPayment.findMany({
      where: {
        ...(filters.association_id && { association_id: Number(filters.association_id) }),
        ...(filters.driver_id && { driver_id: Number(filters.driver_id) }),
        ...(filters.created_by_user_id && { created_by_user_id: Number(filters.created_by_user_id) }),
        ...(filters.fee_plan && { fee_plan: filters.fee_plan }),
        ...(filters.plate_number && { plate_number: filters.plate_number }),
        ...(filters.payment_method && { payment_method: filters.payment_method }),
        ...(filters.from_date && {
          paid_at: { gte: new Date(filters.from_date + 'T00:00:00+03:00') },
        }),
        ...(filters.to_date && {
          paid_at: { lte: new Date(filters.to_date + 'T23:59:59+03:00') },
        }),
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

    // ✅ NEW METHOD
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
