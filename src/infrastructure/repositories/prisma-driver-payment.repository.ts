import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DRIVER_PAYMENT_REPOSITORY,
  IDriverPaymentRepository,
  DriverPaymentCreate,
} from '../../domain/repositories/driver-payment.repository';

@Injectable()
export class PrismaDriverPaymentRepository implements IDriverPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(row: DriverPaymentCreate): Promise<void> {
    await this.prisma.driverPayment.create({
      data: {
        association_id: row.association_id,
        driver_id: row.driver_id,
        fee_plan: row.fee_plan as any,
        prepaid_qty: row.prepaid_qty,
        included_interest: row.included_interest as any,
        included_current_fee: row.included_current_fee,
        amount: row.amount as any,
        covered_start_date: row.covered_start_date,
        covered_end_date: row.covered_end_date,
        paid_at: row.paid_at,
        created_by_user_id: row.created_by_user_id,
        plate_number: row.plate_number ?? null,
      },
    });
  }
}
