import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUserPayload = {
  userId: number;
  user_type: 'Superadmin' | 'Admin' | 'Association' | 'Driver' | 'Controller';
  association_id: number | null;
  jti: string;
  exp: number; 
};


export const AuthUser = createParamDecorator(
  (data: keyof AuthUserPayload | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as AuthUserPayload | undefined;
    if (!user) return null;
    return data ? user[data] : user;
  },
);
