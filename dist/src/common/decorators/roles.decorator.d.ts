export type Role = 'Superadmin' | 'Admin' | 'Association' | 'Driver' | 'Controller';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
