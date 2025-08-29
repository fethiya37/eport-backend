import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AssociationContextGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    req.context ??= {};

    const paramId = req.params?.associationId ? Number(req.params.associationId) : undefined;
    if (paramId && Number.isFinite(paramId)) {
      req.context.associationId = paramId;
      return true;
    }

    // fallback to JWT (association web / mobile users)
    if (req.user?.association_id) {
      req.context.associationId = req.user.association_id;
    }

    return true;
  }
}
