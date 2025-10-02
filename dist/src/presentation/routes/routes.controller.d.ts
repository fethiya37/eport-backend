import { RoutesService } from '../../application/services/routes.service';
import { UpsertGroupWithRoutesDto } from './dto/upsert-group-with-routes.dto';
import { RouteFilterDto } from './dto/route-filter.dto';
import { RouteInputDto } from './dto/route-input.dto';
import type { UserContext } from 'src/common/context/user-context';
export declare class RoutesController {
    private readonly service;
    constructor(service: RoutesService);
    listGroups(includeRoutes?: boolean): Promise<({
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group: string;
    } & {
        routes?: import("@prisma/client").Route[];
    })[]>;
    listRoutes(filter: RouteFilterDto): Promise<{
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
    getGroup(id: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group: string;
    } & {
        routes?: import("@prisma/client").Route[];
    }>;
    upsertGroupWithRoutes(user: UserContext, dto: UpsertGroupWithRoutesDto): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group: string;
    } & {
        routes: import("@prisma/client").Route[];
    }>;
    updateSingleRoute(user: UserContext, id: number, body: RouteInputDto): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group_id: number;
        departure: string;
        arrival: string;
        kilometer: import("@prisma/client/runtime/library").Decimal | null;
        tariff: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    deleteGroup(user: UserContext, id: number): Promise<void>;
}
