import type { IOwnerRepository } from '../../domain/repositories/owner.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOwnerDto } from '../../presentation/owner/dto/create-owner.dto';
import { UpdateOwnerDto } from '../../presentation/owner/dto/update-owner.dto';
import { UserContext } from 'src/common/context/user-context';
import { ActivityLogService } from '../services/activity-log.service';
export declare class OwnerService {
    private readonly owners;
    private readonly prisma;
    private readonly activityLog;
    constructor(owners: IOwnerRepository, prisma: PrismaService, activityLog: ActivityLogService);
    create(ctx: UserContext, dto: CreateOwnerDto): Promise<{
        id: number;
        phone_number: string;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        full_name: string;
    }>;
    findAll(ctx: UserContext, association_id?: number): Promise<{
        id: number;
        phone_number: string;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        full_name: string;
    }[]>;
    findOne(ctx: UserContext, id: number): Promise<{
        id: number;
        phone_number: string;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        full_name: string;
    }>;
    update(ctx: UserContext, id: number, dto: UpdateOwnerDto): Promise<{
        id: number;
        phone_number: string;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        full_name: string;
    }>;
    remove(ctx: UserContext, id: number): Promise<{
        id: number;
        phone_number: string;
        association_id: number;
        created_at: Date;
        updated_at: Date;
        full_name: string;
    }>;
}
