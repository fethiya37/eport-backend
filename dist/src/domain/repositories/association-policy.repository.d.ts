export declare const ASSOCIATION_POLICY_REPOSITORY: unique symbol;
export type AssociationPolicyDTO = {
    association_id: number;
    weekly_fee: number;
    monthly_fee: number;
    daily_fine_percent: number;
};
export interface IAssociationPolicyRepository {
    upsert(data: AssociationPolicyDTO): Promise<AssociationPolicyDTO>;
    get(association_id: number): Promise<AssociationPolicyDTO | null>;
}
