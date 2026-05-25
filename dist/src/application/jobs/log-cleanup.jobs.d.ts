import { PrismaService } from '../../../prisma/prisma.service';
export declare class LogCleanupJobs {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    cleanupOldActivityLogs(): Promise<void>;
    cleanupExpiredTokens(): Promise<void>;
}
