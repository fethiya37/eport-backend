import { RouteQuotaService } from '../../application/services/route-quota.service';
import { CreateRouteQuotaDto } from './dto/create-route-quota.dto';
import { UpdateRouteQuotaDto } from './dto/update-route-quota.dto';
import { RouteQuotaFilterDto } from './dto/route-quota-filter.dto';
import type { UserContext } from 'src/common/context/user-context';
import { CreateManyRouteQuotasDto } from './dto/create-many-route-quotas.dto';
export declare class RouteQuotaController {
    private readonly service;
    constructor(service: RouteQuotaService);
    create(user: UserContext, dto: CreateRouteQuotaDto): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.RouteQuotaStatus;
        start_date: Date;
        route_id: number;
        end_date: Date;
        no_vehicles: number;
        remaining_vehicles: number;
    }>;
    find(user: UserContext, filter: RouteQuotaFilterDto): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.RouteQuotaStatus;
        start_date: Date;
        route_id: number;
        end_date: Date;
        no_vehicles: number;
        remaining_vehicles: number;
    }[]>;
    update(user: UserContext, id: number, dto: UpdateRouteQuotaDto): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.RouteQuotaStatus;
        start_date: Date;
        route_id: number;
        end_date: Date;
        no_vehicles: number;
        remaining_vehicles: number;
    }>;
    createMany(user: UserContext, dto: CreateManyRouteQuotasDto): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.RouteQuotaStatus;
        start_date: Date;
        route_id: number;
        end_date: Date;
        no_vehicles: number;
        remaining_vehicles: number;
    }[]>;
    remove(user: UserContext, id: number): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.RouteQuotaStatus;
        start_date: Date;
        route_id: number;
        end_date: Date;
        no_vehicles: number;
        remaining_vehicles: number;
    }>;
}
