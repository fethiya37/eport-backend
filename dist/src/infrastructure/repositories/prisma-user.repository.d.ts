import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository, UserFilter } from '../../domain/repositories/user.repository';
import { User } from '@prisma/client';
export declare class PrismaUserRepository implements IUserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        phone_number: string;
        user_type: User['user_type'];
        name?: string | null;
        association_id: number | null;
        password_hash: string;
    }): Promise<User>;
    findAll(filter?: UserFilter): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    update(id: number, data: Partial<User>): Promise<User>;
    remove(id: number): Promise<User>;
}
