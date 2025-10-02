import { PrismaService } from '../../../prisma/prisma.service';
import { IDriverPaymentRepository, DriverPaymentCreate } from '../../domain/repositories/driver-payment.repository';
import { DriverPayment, Prisma } from '@prisma/client';
export declare class PrismaDriverPaymentRepository implements IDriverPaymentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(row: DriverPaymentCreate, tx?: Prisma.TransactionClient): Promise<DriverPayment>;
}
