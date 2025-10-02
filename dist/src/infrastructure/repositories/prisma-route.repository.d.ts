import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IRoutesRepository, RouteFilter, RouteUpsertInput, UpsertGroupWithRoutesArgs } from 'src/domain/repositories/route.repository';
export declare class PrismaRoutesRepository implements IRoutesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listRouteGroups(includeRoutes: boolean): Prisma.PrismaPromise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group: string;
    }[]>;
    listRoutes(filter: RouteFilter): Prisma.PrismaPromise<({
        route_group: {
            id: number;
            created_at: Date;
            updated_at: Date;
            route_group: string;
        };
    } & {
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group_id: number;
        departure: string;
        arrival: string;
        kilometer: Prisma.Decimal | null;
        tariff: Prisma.Decimal | null;
    })[]>;
    getRoute(id: number): Prisma.Prisma__RouteClient<({
        route_group: {
            id: number;
            created_at: Date;
            updated_at: Date;
            route_group: string;
        };
    } & {
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group_id: number;
        departure: string;
        arrival: string;
        kilometer: Prisma.Decimal | null;
        tariff: Prisma.Decimal | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    getRouteGroup(id: number, includeRoutes: boolean): Prisma.Prisma__RouteGroupClient<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    upsertGroupWithRoutes(args: UpsertGroupWithRoutesArgs): Promise<any>;
    updateSingleRoute(id: number, r: RouteUpsertInput): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        route_group_id: number;
        departure: string;
        arrival: string;
        kilometer: Prisma.Decimal | null;
        tariff: Prisma.Decimal | null;
    }>;
    private ensureGroup;
    private validateRouteInput;
    existsRoute(id: number): Promise<boolean>;
    deleteGroup(id: number): Promise<void>;
}
