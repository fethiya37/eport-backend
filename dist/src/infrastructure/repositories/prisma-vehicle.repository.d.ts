import { PrismaService } from '../../../prisma/prisma.service';
import { IVehicleRepository, VehicleFilter } from '../../domain/repositories/vehicle.repository';
import { Vehicle, VehicleStatus } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';
export declare class PrismaVehicleRepository implements IVehicleRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private scopeWhere;
    create(ctx: UserContext, data: {
        plate_number: string;
        libre_no?: string | null;
        owner_id: number;
        association_id: number;
        driver_id?: number | null;
        make?: string | null;
        model?: string | null;
        color?: string | null;
        capacity?: number | null;
        is_weekly: boolean;
    }): Promise<Vehicle>;
    findAll(ctx: UserContext, filter?: VehicleFilter): Promise<Vehicle[]>;
    findById(ctx: UserContext, id: number): Promise<Vehicle | null>;
    findActiveWithoutDriver(ctx: UserContext): Promise<Vehicle[]>;
    update(ctx: UserContext, id: number, data: Partial<{
        plate_number: string | null;
        libre_no: string | null;
        owner_id: number;
        driver_id: number | null;
        make: string | null;
        model: string | null;
        color: string | null;
        capacity: number | null;
        status: VehicleStatus;
        is_weekly: boolean;
    }>): Promise<Vehicle>;
    remove(ctx: UserContext, id: number): Promise<Vehicle>;
    findAvailableForQuotaOrDirect(ctx: UserContext, input: {
        association_id?: number;
        is_weekly: boolean;
        start_date: Date;
        mode: 'quota' | 'direct';
    }): Promise<{
        count: number;
        vehicles?: Vehicle[];
    }>;
}
