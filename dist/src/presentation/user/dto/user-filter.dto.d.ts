import { UserType } from '@prisma/client';
export declare class UserFilterDto {
    id?: number;
    phone_number?: string;
    user_type?: UserType;
    name?: string;
    is_locked?: string;
    association_id?: number;
}
