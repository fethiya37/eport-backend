import type { UserContext } from 'src/common/context/user-context';
import { AssociationPolicyService } from '../../application/services/association-policy.service';
import { UpsertPolicyDto } from './dto/upsert-policy.dto';
export declare class AssociationPolicyController {
    private readonly service;
    constructor(service: AssociationPolicyService);
    get(user: UserContext): Promise<import("../../domain/repositories/association-policy.repository").AssociationPolicyDTO | null>;
    upsert(user: UserContext, dto: UpsertPolicyDto): Promise<import("../../domain/repositories/association-policy.repository").AssociationPolicyDTO>;
}
