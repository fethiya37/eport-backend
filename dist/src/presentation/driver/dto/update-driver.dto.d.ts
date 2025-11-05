import { DriverStatus } from '@prisma/client';
export declare class UpdateDriverDto {
    full_name?: string;
    phone_number?: string;
    license_no?: string | null;
    license_expiry?: string | null;
    status?: DriverStatus;
    has_smartphone?: boolean;
    active_until_date?: string | null;
    interest_accrued?: number;
}
