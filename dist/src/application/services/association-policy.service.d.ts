import { type IAssociationPolicyRepository } from '../../domain/repositories/association-policy.repository';
import type { UserContext } from 'src/common/context/user-context';
export declare class AssociationPolicyService {
    private readonly repo;
    constructor(repo: IAssociationPolicyRepository);
    upsert(ctx: UserContext, dto: {
        weekly_fee: number;
        monthly_fee: number;
        daily_fine_percent: number;
    }): Promise<import("../../domain/repositories/association-policy.repository").AssociationPolicyDTO>;
    get(ctx: UserContext): Promise<import("../../domain/repositories/association-policy.repository").AssociationPolicyDTO | null>;
}
