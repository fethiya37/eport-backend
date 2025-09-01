import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isAdminLike } from '../../common/auth/roles.util';
import { Role, ROLES_KEY } from 'src/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { user_type?: Role } | undefined;

    if (!user?.user_type) return false;

    // If route requires an admin-like role, let both Admin & Superadmin pass
    if (required.some((r) => r === 'Admin' || r === 'Superadmin')) {
      if (isAdminLike(user.user_type)) return true;
    }

    // Otherwise match exact role
    return required.includes(user.user_type);
  }
}
