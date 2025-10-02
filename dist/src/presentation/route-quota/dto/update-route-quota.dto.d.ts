import { RouteQuotaStatus } from '@prisma/client';
export declare class UpdateRouteQuotaDto {
    start_date?: string;
    end_date?: string;
    no_vehicles?: number;
    status?: RouteQuotaStatus;
    remaining_vehicles?: number;
}
