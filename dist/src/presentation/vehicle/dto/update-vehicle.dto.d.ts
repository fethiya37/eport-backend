import { VehicleStatus } from '@prisma/client';
export declare class UpdateVehicleDto {
    plate_number?: string | null;
    libre_no?: string | null;
    driver_id?: number | null;
    make?: string | null;
    model?: string | null;
    color?: string | null;
    capacity?: number | null;
    vehicle_status?: VehicleStatus;
    is_weekly?: boolean;
}
