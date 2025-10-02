import { VehicleStatus } from '@prisma/client';
export declare class VehicleFilterDto {
    association_id?: number;
    id?: number;
    plate_number?: string;
    status?: VehicleStatus;
    owner_id?: number;
    driver_id?: number;
    make?: string;
    model?: string;
    color?: string;
    is_weekly?: boolean;
}
