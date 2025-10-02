import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AssociationContextGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean;
}
