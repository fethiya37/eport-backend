import { UserService } from '../../application/services/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { UserContext } from 'src/common/context/user-context';
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    create(user: UserContext, dto: CreateUserDto): Promise<{
        id: number;
        phone_number: string;
        user_type: import("@prisma/client").$Enums.UserType;
        name: string | null;
        password_hash: string | null;
        is_locked: boolean;
        failed_login_attempts: number;
        locked_until: Date | null;
        association_id: number | null;
        created_at: Date;
        updated_at: Date;
    }>;
    findAll(user: UserContext, filter: UserFilterDto): Promise<{
        id: number;
        phone_number: string;
        user_type: import("@prisma/client").$Enums.UserType;
        name: string | null;
        password_hash: string | null;
        is_locked: boolean;
        failed_login_attempts: number;
        locked_until: Date | null;
        association_id: number | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findOne(user: UserContext, id: number): Promise<{
        id: number;
        phone_number: string;
        user_type: import("@prisma/client").$Enums.UserType;
        name: string | null;
        password_hash: string | null;
        is_locked: boolean;
        failed_login_attempts: number;
        locked_until: Date | null;
        association_id: number | null;
        created_at: Date;
        updated_at: Date;
    }>;
    update(user: UserContext, id: number, dto: UpdateUserDto): Promise<{
        id: number;
        phone_number: string;
        user_type: import("@prisma/client").$Enums.UserType;
        name: string | null;
        password_hash: string | null;
        is_locked: boolean;
        failed_login_attempts: number;
        locked_until: Date | null;
        association_id: number | null;
        created_at: Date;
        updated_at: Date;
    }>;
    remove(user: UserContext, id: number): Promise<{
        id: number;
        phone_number: string;
        user_type: import("@prisma/client").$Enums.UserType;
        name: string | null;
        password_hash: string | null;
        is_locked: boolean;
        failed_login_attempts: number;
        locked_until: Date | null;
        association_id: number | null;
        created_at: Date;
        updated_at: Date;
    }>;
    changeMyPassword(user: UserContext, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
}
