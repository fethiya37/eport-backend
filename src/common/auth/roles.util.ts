import type { Role } from '../decorators/roles.decorator';

export const isAdminLike = (role: Role) => role === 'Superadmin' || role === 'Admin';
