import { PrismaService } from '../../../prisma/prisma.service';
type JwtPayload = {
    sub: number;
    user_type: 'Superadmin' | 'Admin' | 'Association' | 'Driver' | 'Controller';
    association_id: number | null;
    jti: string;
    exp: number;
};
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        userId: number;
        user_type: import("@prisma/client").$Enums.UserType;
        association_id: number | null;
        jti: string;
        exp: number;
    }>;
}
export {};
