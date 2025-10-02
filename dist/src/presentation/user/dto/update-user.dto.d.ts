import { UserType } from '@prisma/client';
export declare class UpdateUserDto {
    phone_number?: string;
    user_type?: UserType;
    name?: string | null;
    is_locked?: boolean;
    association_id?: number | null;
}
