import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AssociationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | null => {
    const req = ctx.switchToHttp().getRequest();
    return (req.user?.association_id ?? null) as number | null;
  },
);
