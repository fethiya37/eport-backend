import { Prisma, Route, RouteGroup } from '@prisma/client';

export const ROUTES_REPOSITORY = Symbol('ROUTES_REPOSITORY');

export type RouteFilter = {
  route_group_id?: number;
  departure_contains?: string;
  arrival_contains?: string;
};

export type RouteUpsertInput = {
  id?: number;                // if present → update
  departure: string;          // required
  arrival: string;            // required
  kilometer?: string | number | null; // optional (nullable)
  tariff?: string | number | null;    // optional (nullable)
};

export type UpsertGroupWithRoutesArgs = {
  route_group_id?: number;    // use existing group if provided
  route_group?: string;       // required if route_group_id is not provided
  routes: RouteUpsertInput[]; // one or many
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
}
