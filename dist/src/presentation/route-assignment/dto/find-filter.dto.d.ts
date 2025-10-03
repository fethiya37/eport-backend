import { RouteAssignmentStatus, PaymentStatus } from '@prisma/client';
export declare class RouteAssignmentFilterDto {
    association_id?: number;
    route_id?: number;
    status?: RouteAssignmentStatus;
    is_weekly?: boolean;
    date_from?: string;
    date_to?: string;
    driver_id?: number;
    vehicle_id?: number;
    payment_status?: PaymentStatus;
    route_quota_id?: number;
}
