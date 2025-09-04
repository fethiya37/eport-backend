import { RouteQuota } from '@prisma/client';

export const ROUTE_QUOTA_REPOSITORY = Symbol('ROUTE_QUOTA_REPOSITORY');

export type RouteQuotaCreateRow = {
  association_id: number;
  route_id: number;
  start_date: Date;
  end_date: Date;
  no_vehicles: number;
};

export interface IRouteQuotaRepository {
  create(data: RouteQuotaCreateRow): Promise<RouteQuota>;

  // 👇 NEW: bulk create
  createMany(rows: RouteQuotaCreateRow[]): Promise<RouteQuota[]>;

  find(filter: { association_id?: number; route_id?: number }): Promise<RouteQuota[]>;

  update(
    id: number,
    data: Partial<{ start_date: Date; end_date: Date; no_vehicles: number }>
  ): Promise<RouteQuota>;

  findById(id: number): Promise<RouteQuota | null>;
}
