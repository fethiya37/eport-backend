export const DRIVER_PAYMENT_REPOSITORY = Symbol('DRIVER_PAYMENT_REPOSITORY');

export type DriverPaymentCreate = {
  association_id: number;
  driver_id: number;
  fee_plan: 'WEEKLY' | 'MONTHLY';
  prepaid_qty: number;             // N future periods
  included_interest: number;
  included_current_fee: number;    // 0 or 1
  amount: number;
  covered_start_date: Date;        // GC
  covered_end_date: Date;          // GC
  paid_at: Date;
  created_by_user_id: number;
  plate_number?: string | null;
};

export interface IDriverPaymentRepository {
  create(row: DriverPaymentCreate): Promise<void>;
}
