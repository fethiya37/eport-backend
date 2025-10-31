import { UserType } from '@prisma/client';
export declare class LoginDto {
    phone_number: string;
    password: string;
    as?: UserType;
}
