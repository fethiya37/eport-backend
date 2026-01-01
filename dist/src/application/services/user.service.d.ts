import { UserFilter } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../../presentation/user/dto/create-user.dto';
import { UpdateUserDto } from '../../presentation/user/dto/update-user.dto';
import { ChangePasswordDto } from '../../presentation/user/dto/change-password.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserContext } from 'src/common/context/user-context';
import { ActivityLogService } from '../services/activity-log.service';
export declare class UserService {
    private readonly users;
    private readonly prisma;
    private readonly activityLog;
    constructor(users: IUserRepository, prisma: PrismaService, activityLog: ActivityLogService);
    create(ctx: UserContext, dto: CreateUserDto): Promise<{
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
    findAll(ctx: UserContext, raw: UserFilter): Promise<{
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
    findOne(ctx: UserContext, id: number): Promise<{
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
    update(ctx: UserContext, id: number, dto: UpdateUserDto): Promise<{
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
    remove(ctx: UserContext, id: number): Promise<{
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
    changeOwnPassword(ctx: UserContext, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
}
