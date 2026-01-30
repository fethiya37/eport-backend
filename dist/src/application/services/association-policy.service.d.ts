import { ActivityLogService } from './activity-log.service';
import type { UserContext } from 'src/common/context/user-context';
import { type IAssociationPolicyRepository } from '../../domain/repositories/association-policy.repository';
type PolicyInput = {
    weekly_fee: number;
    monthly_fee: number;
    daily_fine_percent: number;
};
export declare class AssociationPolicyService {
    private readonly repo;
    private readonly activityLog;
    constructor(repo: IAssociationPolicyRepository, activityLog: ActivityLogService);
    private assertPolicyInput;
    upsert(ctx: UserContext, dto: PolicyInput): Promise<import("../../domain/repositories/association-policy.repository").AssociationPolicyDTO>;
    get(ctx: UserContext): Promise<import("../../domain/repositories/association-policy.repository").AssociationPolicyDTO | null>;
}
export {};
