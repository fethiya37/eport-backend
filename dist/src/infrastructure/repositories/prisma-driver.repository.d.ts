import { PrismaService } from '../../../prisma/prisma.service';
import { IDriverRepository, DriverFilter } from '../../domain/repositories/driver.repository';
import { Driver, Prisma } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';
export declare class PrismaDriverRepository implements IDriverRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private scopeWhere;
    create(ctx: UserContext, data: {
        user_id: number;
        association_id: number;
        full_name: string;
        phone_number: string;
        license_no?: string | null;
        license_expiry?: Date | null;
        has_smartphone?: boolean;
    }, tx: Prisma.TransactionClient): Promise<Driver>;
    findAll(ctx: UserContext, filter?: DriverFilter): Promise<Driver[]>;
    findById(ctx: UserContext, id: number): Promise<Driver | null>;
    update(ctx: UserContext, id: number, data: Partial<{
        full_name: string;
        phone_number: string;
        status: Driver['status'];
        license_no: string | null;
        license_expiry: Date | null;
        has_smartphone: boolean;
        active_until_date: Date | null;
        payment_status: 'ACTIVE' | 'INACTIVE';
        interest_accrued: number;
        last_accrual_date: Date | null;
        last_accrual_amount: number | null;
    }>): Promise<Driver>;
    remove(ctx: UserContext, id: number, tx: Prisma.TransactionClient): Promise<Driver>;
    findWithoutVehicle(ctx: UserContext): Promise<Driver[]>;
}
