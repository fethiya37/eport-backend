import { UserType } from '@prisma/client';
export declare class CreateUserDto {
    phone_number: string;
    user_type: UserType;
    name?: string | null;
    association_id?: number | null;
}
