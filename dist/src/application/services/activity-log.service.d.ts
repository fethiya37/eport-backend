import type { IActivityLogRepository, ActivityLogFilter } from '../../domain/repositories/activity-log.repository';
import type { UserContext } from 'src/common/context/user-context';
export declare class ActivityLogService {
    private readonly logs;
    constructor(logs: IActivityLogRepository);
    log(ctx: UserContext | null, input: {
        module: string;
        action: string;
        entity?: string;
        entity_id?: number;
        ip_address?: string | null;
    }): Promise<void>;
    findMany(ctx: UserContext, filter: ActivityLogFilter, options?: {
        skip?: number;
        take?: number;
    }): Promise<import("../../domain/repositories/activity-log.repository").ActivityLogWithRelations[]>;
    findOne(ctx: UserContext, id: number): Promise<import("../../domain/repositories/activity-log.repository").ActivityLogWithRelations | null>;
}
