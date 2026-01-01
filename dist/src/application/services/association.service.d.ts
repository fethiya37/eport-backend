import { AssociationFilter, type IAssociationRepository } from '../../domain/repositories/association.repository';
import { CreateAssociationDto } from '../../presentation/association/dto/create-association.dto';
import { UpdateAssociationDto } from '../../presentation/association/dto/update-association.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import type { UserContext } from 'src/common/context/user-context';
import { ActivityLogService } from '../services/activity-log.service';
export declare class AssociationService {
    private readonly associations;
    private readonly prisma;
    private readonly activityLog;
    constructor(associations: IAssociationRepository, prisma: PrismaService, activityLog: ActivityLogService);
    publicList(filter?: AssociationFilter): Promise<{
        id: number;
        phone_number: string | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        logo: string | null;
    }[]>;
    publicGet(id: number): Promise<{
        id: number;
        phone_number: string | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        logo: string | null;
    }>;
    create(ctx: UserContext, dto: CreateAssociationDto): Promise<{
        id: number;
        phone_number: string | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        logo: string | null;
    }>;
    update(ctx: UserContext, id: number, dto: UpdateAssociationDto): Promise<{
        id: number;
        phone_number: string | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        logo: string | null;
    }>;
    delete(ctx: UserContext, id: number): Promise<{
        message: string;
    }>;
}
