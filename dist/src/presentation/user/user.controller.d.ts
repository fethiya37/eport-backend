import { UserService } from '../../application/services/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { UserContext } from 'src/common/context/user-context';
import { UserType } from '@prisma/client';
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    private toSafeUser;
    create(user: UserContext, dto: CreateUserDto): Promise<{
        user: {
            id: any;
            phone_number: any;
            user_type: UserType;
            name: any;
            association_id: any;
            is_locked: boolean;
            created_at: any;
            updated_at: any;
        };
        temp_password: string;
    }>;
    findAll(user: UserContext, filter: UserFilterDto): Promise<{
        id: any;
        phone_number: any;
        user_type: UserType;
        name: any;
        association_id: any;
        is_locked: boolean;
        created_at: any;
        updated_at: any;
    }[]>;
    findOne(user: UserContext, id: number): Promise<{
        id: any;
        phone_number: any;
        user_type: UserType;
        name: any;
        association_id: any;
        is_locked: boolean;
        created_at: any;
        updated_at: any;
    }>;
    update(user: UserContext, id: number, dto: UpdateUserDto): Promise<{
        id: any;
        phone_number: any;
        user_type: UserType;
        name: any;
        association_id: any;
        is_locked: boolean;
        created_at: any;
        updated_at: any;
    }>;
    remove(user: UserContext, id: number): Promise<{
        id: any;
        phone_number: any;
        user_type: UserType;
        name: any;
        association_id: any;
        is_locked: boolean;
        created_at: any;
        updated_at: any;
    }>;
    resetPassword(user: UserContext, id: number): Promise<{
        temp_password: string;
    }>;
    changeMyPassword(user: UserContext, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
}
