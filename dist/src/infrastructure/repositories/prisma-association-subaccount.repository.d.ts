import { PrismaService } from '../../../prisma/prisma.service';
import { IAssociationSubaccountRepository } from '../../domain/repositories/association-subaccount.repository';
import { AssociationSubaccount, Prisma } from '@prisma/client';
import type { UserContext } from 'src/common/context/user-context';
export declare class PrismaAssociationSubaccountRepository implements IAssociationSubaccountRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureScope;
    create(ctx: UserContext, data: {
        association_id: number;
        chapa_id: string;
        business_name: string;
        account_name: string;
        account_number: string;
    }, tx?: Prisma.TransactionClient): Promise<AssociationSubaccount>;
    findByAssociationId(ctx: UserContext, association_id: number): Promise<AssociationSubaccount | null>;
    findById(ctx: UserContext, id: number): Promise<AssociationSubaccount | null>;
    hardDelete(ctx: UserContext, id: number): Promise<void>;
}
