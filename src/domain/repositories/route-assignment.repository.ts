import { RouteAssignment, RouteAssignmentHistoryStatus, RouteAssignmentStatus, RouteQuota } from '@prisma/client';

export const ROUTE_ASSIGNMENT_REPOSITORY = Symbol('ROUTE_ASSIGNMENT_REPOSITORY');

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
};


export type RouteAssignmentFindFilter = {
  association_id?: number;
  route_id?: number;
  status?: RouteAssignmentStatus;
  is_weekly?: boolean;
  date_from?: Date;
  date_to?: Date;
  vehicle_id?: number;
};

export interface IRouteAssignmentRepository {
  upsertMany(data: RouteAssignmentUpsertRow[]): Promise<RouteAssignment[]>;
  approveMany(ids: number[], approver_user_id: number): Promise<number>;
  find(filter: RouteAssignmentFindFilter): Promise<RouteAssignment[]>;
  findByIds(ids: number[]): Promise<RouteAssignment[]>;

  getQuotaById(id: number): Promise<RouteQuota | null>;

  // ✅ NEW helpers for status refresh
  hasApprovedOnDate(association_id: number, vehicle_id: number, day: Date): Promise<boolean>;

  remove(id: number): Promise<RouteAssignment>;   // ✅ NEW

}
