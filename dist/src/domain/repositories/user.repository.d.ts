import { User, UserType } from '@prisma/client';
export declare const USER_REPOSITORY: unique symbol;
export type UserFilter = {
    id?: number;
    phone_number?: string;
    user_type?: UserType;
    name?: string;
    is_locked?: boolean;
    association_id?: number;
};
export interface IUserRepository {
    create(data: {
        phone_number: string;
        user_type: UserType;
        name?: string | null;
        association_id: number | null;
        password_hash: string;
    }): Promise<User>;
    findAll(filter?: UserFilter): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    update(id: number, data: Partial<{
        phone_number: string;
        user_type: UserType;
        name: string | null;
        is_locked: boolean;
        association_id: number | null;
        password_hash: string | null;
        must_change_password: boolean;
        failed_login_attempts: number;
        locked_until: Date | null;
    }>): Promise<User>;
    remove(id: number): Promise<User>;
}
