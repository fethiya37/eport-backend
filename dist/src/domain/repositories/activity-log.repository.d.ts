import { ActivityLog } from '@prisma/client';
export declare const ACTIVITY_LOG_REPOSITORY: unique symbol;
export interface ActivityLogCreate {
    user_id?: number | null;
    association_id?: number | null;
    action: string;
    entity_type?: string | null;
    entity_id?: number | null;
    description?: string | null;
    ip_address?: string | null;
}
export interface ActivityLogFilter {
    user_id?: number;
    association_id?: number;
    action?: string;
    entity_type?: string;
    entity_id?: number;
    date_from?: Date;
    date_to?: Date;
}
export interface ActivityLogWithRelations extends ActivityLog {
    user?: {
        id: number;
        name: string | null;
        phone_number: string;
        user_type: string;
    } | null;
    association?: {
        id: number;
        name: string;
    } | null;
}
export interface IActivityLogRepository {
    create(data: ActivityLogCreate): Promise<ActivityLog>;
    findById(id: number): Promise<ActivityLogWithRelations | null>;
    findMany(filter: ActivityLogFilter, options?: {
        skip?: number;
        take?: number;
    }): Promise<ActivityLogWithRelations[]>;
}
