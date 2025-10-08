import { RouteAssignment, RouteAssignmentHistoryStatus, RouteAssignmentStatus, RouteQuota, PaymentStatus } from '@prisma/client';
export declare const ROUTE_ASSIGNMENT_REPOSITORY: unique symbol;
export type RouteAssignmentUpsertRow = {
    id?: number;
    route_id: number;
    vehicle_id: number;
    association_id: number;
    start_date: Date;
    end_date: Date;
    is_weekly: boolean;
    status: RouteAssignmentStatus;
    assigned_by_user_id: number;
    approved_by_user_id?: number | null;
    approved_at?: Date | null;
    route_quota_id?: number | null;
    history_status?: RouteAssignmentHistoryStatus | null;
    payment_status: PaymentStatus;
};
export type RouteAssignmentFindFilter = {
    association_id?: number;
    route_id?: number;
    status?: RouteAssignmentStatus;
    is_weekly?: boolean;
    date_from?: Date;
    date_to?: Date;
    vehicle_id?: number;
    payment_status?: PaymentStatus;
    route_quota_id?: number;
};
export type RouteAssignmentWithRelations = RouteAssignment & {
    vehicle: {
        id: number;
        plate_number: string;
        driver: {
            id: number;
            full_name: string;
            phone_number: string;
        } | null;
    };
    route: {
        id: number;
        departure: string;
        arrival: string;
    };
    assigned_by: {
        id: number;
        name: string | null;
    };
    approved_by: {
        id: number;
        name: string | null;
    } | null;
    association: {
        id: number;
        name: string;
    };
};
export interface IRouteAssignmentRepository {
    upsertMany(data: RouteAssignmentUpsertRow[]): Promise<RouteAssignment[]>;
    approveMany(ids: number[], approver_user_id: number): Promise<number>;
    find(filter: RouteAssignmentFindFilter): Promise<RouteAssignmentWithRelations[]>;
    findByIds(ids: number[]): Promise<RouteAssignment[]>;
    getQuotaById(id: number): Promise<RouteQuota | null>;
    hasApprovedOnDate(association_id: number, vehicle_id: number, day: Date): Promise<boolean>;
    remove(id: number): Promise<RouteAssignment>;
}
