import { RouteAssignmentHistoryStatus } from '@prisma/client';
export declare class UpdateAssignmentDto {
    route_id?: number;
    driver_id?: number;
    vehicle_id?: number;
    start_date?: string;
    end_date?: string;
    is_weekly?: boolean;
    status?: 'Approved' | 'Pending';
    route_quota_id?: number | null;
    history_status?: RouteAssignmentHistoryStatus;
}
