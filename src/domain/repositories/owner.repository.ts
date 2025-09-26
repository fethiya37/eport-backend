import { Owner, Prisma } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';

export const OWNER_REPOSITORY = Symbol('OWNER_REPOSITORY');

export interface IOwnerRepository {
  create(
    ctx: UserContext,
    data: {
      association_id: number;
      full_name: string;
      phone_number: string;
    },
    tx: Prisma.TransactionClient,
  ): Promise<Owner>;

  findAll(ctx: UserContext, association_id?: number): Promise<Owner[]>;
  findById(ctx: UserContext, id: number): Promise<Owner | null>;

  update(
    ctx: UserContext,
    id: number,
    data: Partial<{ full_name: string; phone_number: string }>
  ): Promise<Owner>;

  remove(ctx: UserContext, id: number): Promise<Owner>; // ✅ NEW
}
