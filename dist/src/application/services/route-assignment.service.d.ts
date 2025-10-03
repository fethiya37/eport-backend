import { type IRouteAssignmentRepository } from '../../domain/repositories/route-assignment.repository';
import type { UserContext } from 'src/common/context/user-context';
import { PrismaService } from '../../../prisma/prisma.service';
import { BulkUpsertAssignmentsDto } from '../../presentation/route-assignment/dto/bulk-upsert.dto';
import { ApproveAssignmentsDto } from '../../presentation/route-assignment/dto/approve.dto';
import { UpdateAssignmentDto } from '../../presentation/route-assignment/dto/update-assignment.dto';
import { RouteAssignmentFilterDto } from '../../presentation/route-assignment/dto/find-filter.dto';
export declare class RouteAssignmentService {
    private readonly repo;
    private readonly prisma;
    constructor(repo: IRouteAssignmentRepository, prisma: PrismaService);
    private parseGcDate;
    private existsRoute;
    private existsVehicleInAssociation;
    private existsVehicleOverlap;
    bulkUpsert(ctx: UserContext, dto: BulkUpsertAssignmentsDto): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.RouteAssignmentStatus;
        is_weekly: boolean;
        start_date: Date;
        route_id: number;
        vehicle_id: number;
        end_date: Date;
        history_status: import("@prisma/client").$Enums.RouteAssignmentHistoryStatus | null;
        payment_status: import("@prisma/client").$Enums.PaymentStatus;
        assigned_by_user_id: number;
        approved_by_user_id: number | null;
        approved_at: Date | null;
        route_quota_id: number | null;
    }[]>;
    approve(ctx: UserContext, dto: ApproveAssignmentsDto): Promise<{
        approved: number;
    }>;
    find(ctx: UserContext, filter: RouteAssignmentFilterDto): Promise<{
        id: number;
        start_date: Date;
        end_date: Date;
        status: import("@prisma/client").$Enums.RouteAssignmentStatus;
        payment_status: import("@prisma/client").$Enums.PaymentStatus;
        is_weekly: boolean;
        vehicle: {
            id: number;
            plate_number: string;
            driver: {
                id: number;
                full_name: string;
                phone_number: string;
            } | null;
        };
        route: {
            id: number;
            departure: string;
            arrival: string;
        };
        assigned_by: {
            id: number;
            name: string | null;
        };
        approved_by: {
            id: number;
            name: string | null;
        } | null;
    }[]>;
    updateOne(ctx: UserContext, id: number, dto: UpdateAssignmentDto): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.RouteAssignmentStatus;
        is_weekly: boolean;
        start_date: Date;
        route_id: number;
        vehicle_id: number;
        end_date: Date;
        history_status: import("@prisma/client").$Enums.RouteAssignmentHistoryStatus | null;
        payment_status: import("@prisma/client").$Enums.PaymentStatus;
        assigned_by_user_id: number;
        approved_by_user_id: number | null;
        approved_at: Date | null;
        route_quota_id: number | null;
    }>;
    remove(ctx: UserContext, id: number): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.RouteAssignmentStatus;
        is_weekly: boolean;
        start_date: Date;
        route_id: number;
        vehicle_id: number;
        end_date: Date;
        history_status: import("@prisma/client").$Enums.RouteAssignmentHistoryStatus | null;
        payment_status: import("@prisma/client").$Enums.PaymentStatus;
        assigned_by_user_id: number;
        approved_by_user_id: number | null;
        approved_at: Date | null;
        route_quota_id: number | null;
    }>;
    visibleCoverage(ctx: UserContext, q: {
        plate_number?: string;
        driver_id?: number;
    }): Promise<{
        not_full_filled: boolean;
        message?: undefined;
        driver_active_until?: undefined;
        association_name?: undefined;
        plate_number?: undefined;
        driver_name?: undefined;
        assignments?: undefined;
    } | {
        message: string;
        driver_active_until: string;
        not_full_filled?: undefined;
        association_name?: undefined;
        plate_number?: undefined;
        driver_name?: undefined;
        assignments?: undefined;
    } | {
        association_name: string;
        plate_number: string;
        driver_name: string;
        driver_active_until: string;
        assignments: {
            route: {
                id: number;
                departure: string;
                arrival: string;
            };
            start_date_gc: string;
            end_date_gc: string;
            status: import("@prisma/client").$Enums.RouteAssignmentStatus;
        }[];
        not_full_filled?: undefined;
        message?: undefined;
    }>;
}
