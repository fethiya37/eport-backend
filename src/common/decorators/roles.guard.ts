import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AllowedRole } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AllowedRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = ctx.switchToHttp().getRequest();
    // JwtStrategy.validate attaches: { userId, user_type, jti, exp }
    const user = request.user as { user_type?: AllowedRole } | undefined;

    if (!user?.user_type) throw new ForbiddenException('forbidden');

    const ok = required.includes(user.user_type);
    if (!ok) throw new ForbiddenException('forbidden');

    return true;
  }
}
