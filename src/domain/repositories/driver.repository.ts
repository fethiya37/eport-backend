import { Driver, DriverStatus, Prisma } from '@prisma/client';
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
   * Generic update (kept simple): pass absolute values you want saved.
   * Decimal fields can be numbers; Prisma will coerce.
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

      // 👇 new interest-related fields
      interest_accrued: number;            // absolute new value
      last_accrual_date: Date | null;      // set/clear marker date
      last_accrual_amount: number;         // absolute new value (e.g., 0 to clear)
      active_until_date: Date | null;      // in case you need to touch coverage in future
    }>
  ): Promise<Driver>;
}
