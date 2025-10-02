import { PrismaService } from '../../../prisma/prisma.service';
import { RouteQuota, RouteQuotaStatus } from '@prisma/client';
import { IRouteQuotaRepository, RouteQuotaCreateRow } from 'src/domain/repositories/route-quota.repository';
export declare class PrismaRouteQuotaRepository implements IRouteQuotaRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: RouteQuotaCreateRow): Promise<RouteQuota>;
    createMany(rows: RouteQuotaCreateRow[]): Promise<RouteQuota[]>;
    find(filter: {
        association_id?: number;
        route_id?: number;
    }): Promise<RouteQuota[]>;
    update(id: number, data: Partial<{
        start_date: Date;
        end_date: Date;
        no_vehicles: number;
        remaining_vehicles: number;
        status: RouteQuotaStatus;
    }>): Promise<RouteQuota>;
    findById(id: number): Promise<RouteQuota | null>;
    remove(id: number): Promise<RouteQuota>;
}
