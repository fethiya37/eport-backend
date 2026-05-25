import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserType } from '@prisma/client';

@Injectable()
export class AssociationContextGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as
      | {
          user_type?: UserType;
          association_id?: number | null;
        }
      | undefined;

    if (!user) throw new ForbiddenException('Unauthorized');

    if (
      user.user_type &&
      (isAdminLike(user.user_type) || user.user_type === UserType.Controller)
    ) {
      return true;
    }

    if (user.association_id == null) {
      throw new ForbiddenException('Association context required');
    }

    return true;
  }
}
