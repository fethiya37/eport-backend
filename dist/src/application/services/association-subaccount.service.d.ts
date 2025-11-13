import { PrismaService } from '../../../prisma/prisma.service';
import { ChapaApiService } from '../../infrastructure/payments/chapa-api.service';
import { type IAssociationSubaccountRepository } from '../../domain/repositories/association-subaccount.repository';
import type { UserContext } from '../../common/context/user-context';
import { ActivityLogService } from '../services/activity-log.service';
export declare class AssociationSubaccountService {
    private readonly prisma;
    private readonly chapa;
    private readonly repo;
    private readonly activityLog;
    constructor(prisma: PrismaService, chapa: ChapaApiService, repo: IAssociationSubaccountRepository, activityLog: ActivityLogService);
    private resolveAssociationId;
    createForAssociation(ctx: UserContext, dto: {
        bank_code: number;
        account_number: string;
        account_name: string;
        business_name: string;
        split_type?: 'fixed' | 'percentage';
        split_value?: number;
    }, association_id?: number): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        chapa_id: string;
        business_name: string;
        account_name: string;
        account_number: string;
    }>;
    getMine(ctx: UserContext, association_id?: number): Promise<{
        id: number;
        association_id: number;
        created_at: Date;
        chapa_id: string;
        business_name: string;
        account_name: string;
        account_number: string;
    }>;
    hardDelete(ctx: UserContext, id: number): Promise<{
        status: string;
    }>;
}
