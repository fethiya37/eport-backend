import { Route, RouteGroup } from '@prisma/client';

export const ROUTES_REPOSITORY = Symbol('ROUTES_REPOSITORY');

export type RouteFilter = {
  route_group_id?: number;
  departure_contains?: string;
  arrival_contains?: string;
};

export type RouteUpsertInput = {
  id?: number;
  departure: string;
  arrival: string;
  kilometer?: string | number | null;
  tariff?: string | number | null;
};

export type UpsertGroupWithRoutesArgs = {
  route_group_id?: number;
  route_group?: string;
  routes: RouteUpsertInput[];
};

export interface IRoutesRepository {
  // Reads
  listRouteGroups(includeRoutes: boolean): Promise<(RouteGroup & { routes?: Route[] })[]>;
  listRoutes(filter: RouteFilter): Promise<Route[]>;
  getRoute(id: number): Promise<Route | null>;
  getRouteGroup(id: number, includeRoutes: boolean): Promise<(RouteGroup & { routes?: Route[] }) | null>;

  // Writes
  upsertGroupWithRoutes(args: UpsertGroupWithRoutesArgs): Promise<RouteGroup & { routes: Route[] }>;
  updateSingleRoute(id: number, data: RouteUpsertInput): Promise<Route>;

  /** ✅ NEW: cheap existence check by route id */
  existsRoute(id: number): Promise<boolean>;
}
