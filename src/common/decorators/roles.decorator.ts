import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type AllowedRole = 'Superadmin' | 'Admin' | 'Association' | 'Driver' | 'Controller' | 'Owner';

export const Roles = (...roles: AllowedRole[]) => SetMetadata(ROLES_KEY, roles);
