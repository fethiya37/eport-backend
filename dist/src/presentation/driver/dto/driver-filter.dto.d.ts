import { DriverStatus } from '@prisma/client';
export declare class DriverFilterDto {
    association_id?: number;
    id?: number;
    full_name?: string;
    phone_number?: string;
    status?: DriverStatus;
    license_no?: string;
    has_smartphone?: boolean;
}
