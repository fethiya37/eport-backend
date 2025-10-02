import { RouteQuota, RouteQuotaStatus } from '@prisma/client';
export declare const ROUTE_QUOTA_REPOSITORY: unique symbol;
export type RouteQuotaCreateRow = {
    association_id: number;
    route_id: number;
    start_date: Date;
    end_date: Date;
    no_vehicles: number;
    remaining_vehicles?: number;
    status?: RouteQuotaStatus;
};
export interface IRouteQuotaRepository {
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
