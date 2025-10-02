import type { Role } from '../decorators/roles.decorator';
export declare const isAdminLike: (role: Role) => role is "Superadmin" | "Admin";
