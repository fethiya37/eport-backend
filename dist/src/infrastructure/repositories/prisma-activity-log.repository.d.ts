import { PrismaService } from '../../../prisma/prisma.service';
import { ActivityLog } from '@prisma/client';
import { IActivityLogRepository, ActivityLogCreate, ActivityLogFilter, ActivityLogWithRelations } from '../../domain/repositories/activity-log.repository';
export declare class PrismaActivityLogRepository implements IActivityLogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: ActivityLogCreate): Promise<ActivityLog>;
    findById(id: number): Promise<ActivityLogWithRelations | null>;
    findMany(filter: ActivityLogFilter, options?: {
        skip?: number;
        take?: number;
    }): Promise<ActivityLogWithRelations[]>;
}
