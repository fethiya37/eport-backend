import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { isAdminLike } from '../../common/auth/roles.util';

@Injectable()
export class AssociationContextGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as {
      user_type?: string;
      association_id?: number | null;
    } | undefined;

    if (!user) throw new ForbiddenException('Unauthorized');

    // Admin/Superadmin can operate without an association context.
    if (user.user_type && isAdminLike(user.user_type as any)) return true;

    // Everyone else must have a non-null association_id
    if (user.association_id == null) {
      throw new ForbiddenException('Association context required');
    }
    return true;
  }
}
