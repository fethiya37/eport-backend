import { Driver, DriverStatus, PaymentStatus, Prisma } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';

export const DRIVER_REPOSITORY = Symbol('DRIVER_REPOSITORY');

export type DriverFilter = {
  id?: number;
  full_name?: string;
  phone_number?: string;
  status?: DriverStatus;
  license_no?: string;
};

export interface IDriverRepository {
  create(
    ctx: UserContext,
    data: {
      user_id: number;
      association_id: number;
      full_name: string;
      phone_number: string;
      license_no?: string | null;
      license_expiry?: Date | null;
      is_weekly?: boolean;
    },
    tx: Prisma.TransactionClient,
  ): Promise<Driver>;

  findAll(ctx: UserContext, filter?: DriverFilter): Promise<Driver[]>;
  findById(ctx: UserContext, id: number): Promise<Driver | null>;

  /**
   * Unified driver update, extended to support payment/interest fields.
   * Only pass fields you intend to change.
   */
  update(
    ctx: UserContext,
    id: number,
    data: Partial<{
      full_name: string;
      phone_number: string;
      status: DriverStatus;
      license_no: string | null;
      license_expiry: Date | null;
      is_weekly: boolean;

      // payment / coverage fields
      active_until_date: Date | null;
      payment_status: PaymentStatus;

      // interests
      interest_accrued: number;
      last_accrual_date: Date | null;
      last_accrual_amount: number | null;
    }>
  ): Promise<Driver>;
}
