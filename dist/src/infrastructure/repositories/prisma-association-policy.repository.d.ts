import { PrismaService } from '../../../prisma/prisma.service';
import type { IAssociationPolicyRepository, AssociationPolicyDTO } from '../../domain/repositories/association-policy.repository';
export declare class PrismaAssociationPolicyRepository implements IAssociationPolicyRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsert(data: AssociationPolicyDTO): Promise<AssociationPolicyDTO>;
    get(association_id: number): Promise<AssociationPolicyDTO | null>;
}
