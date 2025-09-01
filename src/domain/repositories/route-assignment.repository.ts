import { RouteAssignment, RouteAssignmentStatus } from '@prisma/client';

export const ROUTE_ASSIGNMENT_REPOSITORY = Symbol('ROUTE_ASSIGNMENT_REPOSITORY');

export type RouteAssignmentUpsertRow = {
  id?: number;
  route_id: number;
  driver_id: number;
  vehicle_id: number;
  association_id: number;
  start_date: Date;
  end_date: Date;
  is_weekly: boolean;
  status: RouteAssignmentStatus; // 'Approved' | 'Pending'
};

export interface IRouteAssignmentRepository {
  upsertMany(data: RouteAssignmentUpsertRow[]): Promise<RouteAssignment[]>;
  approveMany(ids: number[]): Promise<number>;
  findByIds(ids: number[]): Promise<RouteAssignment[]>;
}
