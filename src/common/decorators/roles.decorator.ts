import { SetMetadata } from '@nestjs/common';

// Keep it string-based to avoid circular deps; values align with @prisma/client UserType
export type Role =
  | 'Superadmin'
  | 'Admin'
  | 'Association'
  | 'Driver'
  | 'Controller'

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
