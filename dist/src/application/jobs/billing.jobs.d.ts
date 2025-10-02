import { PrismaService } from '../../../prisma/prisma.service';
export declare class BillingJobs {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    dailyFine(): Promise<void>;
}
