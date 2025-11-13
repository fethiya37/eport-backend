import { SetMetadata } from '@nestjs/common';

export type Role =
  | 'Superadmin'
  | 'Admin'
  | 'Association'
  | 'Driver'
  | 'Controller'

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
