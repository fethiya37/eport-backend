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
    tx?: Prisma.TransactionClient
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
      payment_method: (row.payment_method ?? null) as PaymentMethod | null, // <- NEW
    };

    if (tx) {
      return tx.driverPayment.create({ data });
    }
    return this.prisma.driverPayment.create({ data });
  }
}
