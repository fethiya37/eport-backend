import { PrismaService } from '../../../prisma/prisma.service';
import { IOwnerRepository } from '../../domain/repositories/owner.repository';
import { Owner, Prisma } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';
export declare class PrismaOwnerRepository implements IOwnerRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private scopeWhere;
    create(ctx: UserContext, data: {
        association_id: number;
        full_name: string;
        phone_number: string;
    }, tx: Prisma.TransactionClient): Promise<Owner>;
    findAll(ctx: UserContext, association_id?: number): Promise<Owner[]>;
    findById(ctx: UserContext, id: number): Promise<Owner | null>;
    update(ctx: UserContext, id: number, data: Partial<{
        full_name: string;
        phone_number: string;
    }>): Promise<Owner>;
    remove(ctx: UserContext, id: number): Promise<Owner>;
}
