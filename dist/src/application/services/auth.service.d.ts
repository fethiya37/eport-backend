import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
type LoginInput = {
    phone_number: string;
    password: string;
};
type LogoutInput = {
    user_id: number;
    jti: string;
    exp: number;
    token_hash: string;
};
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(input: LoginInput): Promise<{
        access_token: string;
        user: {
            id: number;
            phone_number: string;
            user_type: import("@prisma/client").$Enums.UserType;
            association_id: number | null;
            association_name: string | null;
            driver_id: number | null;
            name: string | null;
        };
        exp: number;
        jti: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    logout(input: LogoutInput): Promise<{
        status: string;
    }>;
}
export {};
