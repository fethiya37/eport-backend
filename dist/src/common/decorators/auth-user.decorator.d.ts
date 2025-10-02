export type AuthUserPayload = {
    userId: number;
    user_type: 'Superadmin' | 'Admin' | 'Association' | 'Driver' | 'Controller';
    association_id: number | null;
    jti: string;
    exp: number;
};
export declare const AuthUser: (...dataOrPipes: (keyof AuthUserPayload | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
