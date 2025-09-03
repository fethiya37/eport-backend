import { RouteQuota } from '@prisma/client';

export const ROUTE_QUOTA_REPOSITORY = Symbol('ROUTE_QUOTA_REPOSITORY');

export interface IRouteQuotaRepository {
  create(data: {
    association_id: number;
    route_id: number;
    start_date: Date;
    end_date: Date;
    no_vehicles: number;
  }): Promise<RouteQuota>;

  // NEW: bulk create (transactional)
  createMany(rows: Array<{
    association_id: number;
    route_id: number;
    start_date: Date;
    end_date: Date;
    no_vehicles: number;
  }>): Promise<RouteQuota[]>;

  find(filter: { association_id?: number; route_id?: number }): Promise<RouteQuota[]>;

  update(
    id: number,
    data: Partial<{ start_date: Date; end_date: Date; no_vehicles: number }>
  ): Promise<RouteQuota>;

  findById(id: number): Promise<RouteQuota | null>;
}
