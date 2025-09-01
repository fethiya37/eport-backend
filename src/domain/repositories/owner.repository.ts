import { Owner, OwnerStatus, Prisma } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';

export const OWNER_REPOSITORY = Symbol('OWNER_REPOSITORY');

export interface IOwnerRepository {
  create(
    ctx: UserContext,
    data: {
      association_id: number;
      full_name: string;
      phone_number: string;
      user_id: number; // linked user created in service
    },
    tx: Prisma.TransactionClient,   // <<< add tx
  ): Promise<Owner>;

  findAll(ctx: UserContext): Promise<Owner[]>;
  findById(ctx: UserContext, id: number): Promise<Owner | null>;

  update(
    ctx: UserContext,
    id: number,
    data: Partial<{ full_name: string; phone_number: string; status: OwnerStatus }>
  ): Promise<Owner>;
}
