import { DriverPayment, FeePlan, PaymentMethod, Prisma } from '@prisma/client';

export const DRIVER_PAYMENT_REPOSITORY = Symbol('DRIVER_PAYMENT_REPOSITORY');

export type DriverPaymentCreate = {
  association_id: number;
  driver_id: number;
  fee_plan: FeePlan | 'WEEKLY' | 'MONTHLY';
  prepaid_qty: number;
  amount: number;                // stored as Decimal
  covered_start_date: Date;
  covered_end_date: Date;
  paid_at: Date;
  created_by_user_id: number;
  payment_method?: PaymentMethod | null; // ✅ enum, nullable
  plate_number?: string | null;          // ✅ NEW field
};

export interface IDriverPaymentRepository {
  create(
    data: DriverPaymentCreate,
    tx?: Prisma.TransactionClient
  ): Promise<DriverPayment>;
}
