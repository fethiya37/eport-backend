import { PrismaService } from '../../../prisma/prisma.service';
import { IRouteAssignmentRepository, RouteAssignmentFindFilter, RouteAssignmentUpsertRow } from '../../domain/repositories/route-assignment.repository';
import { RouteAssignment, RouteQuota } from '@prisma/client';
export declare class PrismaRouteAssignmentRepository implements IRouteAssignmentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertMany(data: RouteAssignmentUpsertRow[]): Promise<RouteAssignment[]>;
    approveMany(ids: number[], approver_user_id: number): Promise<number>;
    find(filter: RouteAssignmentFindFilter): Promise<RouteAssignment[]>;
    findByIds(ids: number[]): Promise<RouteAssignment[]>;
    getQuotaById(id: number): Promise<RouteQuota | null>;
    hasApprovedOnDate(association_id: number, vehicle_id: number, day: Date): Promise<boolean>;
    remove(id: number): Promise<RouteAssignment>;
}
