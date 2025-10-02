import { RouteInputDto } from '../../presentation/routes/dto/route-input.dto';
import { UpsertGroupWithRoutesDto } from '../../presentation/routes/dto/upsert-group-with-routes.dto';
import type { UserContext } from 'src/common/context/user-context';
import { RouteFilter } from 'src/domain/repositories/route.repository';
import type { IRoutesRepository } from 'src/domain/repositories/route.repository';
export declare class RoutesService {
    private readonly repo;
    constructor(repo: IRoutesRepository);
    listRouteGroups(includeRoutes?: boolean): Promise<({
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group: string;
    } & {
        routes?: import("@prisma/client").Route[];
    })[]>;
    listRoutes(filter: RouteFilter): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group_id: number;
        departure: string;
        arrival: string;
        kilometer: import("@prisma/client/runtime/library").Decimal | null;
        tariff: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    getRoute(id: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group_id: number;
        departure: string;
        arrival: string;
        kilometer: import("@prisma/client/runtime/library").Decimal | null;
        tariff: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getRouteGroup(id: number, includeRoutes?: boolean): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group: string;
    } & {
        routes?: import("@prisma/client").Route[];
    }>;
    upsertGroupWithRoutes(ctx: UserContext, dto: UpsertGroupWithRoutesDto): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group: string;
    } & {
        routes: import("@prisma/client").Route[];
    }>;
    updateSingleRoute(ctx: UserContext, id: number, r: RouteInputDto): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group_id: number;
        departure: string;
        arrival: string;
        kilometer: import("@prisma/client/runtime/library").Decimal | null;
        tariff: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    deleteGroup(ctx: UserContext, id: number): Promise<void>;
}
