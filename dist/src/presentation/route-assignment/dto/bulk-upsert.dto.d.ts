import { RouteAssignmentHistoryStatus } from '@prisma/client';
declare class BulkUpsertItemDto {
    route_id: number;
    vehicle_id: number;
    id?: number;
    start_date: string;
    end_date: string;
    is_weekly: boolean;
    route_quota_id?: number;
    history_status?: RouteAssignmentHistoryStatus | null;
}
export declare class BulkUpsertAssignmentsDto {
    association_id?: number;
    items: BulkUpsertItemDto[];
}
export {};
