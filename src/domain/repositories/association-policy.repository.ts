export const ASSOCIATION_POLICY_REPOSITORY = Symbol('ASSOCIATION_POLICY_REPOSITORY');

export type AssociationPolicyDTO = {
  association_id: number;
  weekly_fee: number;
  monthly_fee: number;
  daily_fine_percent: number; // 0.20 = 20%
};

export interface IAssociationPolicyRepository {
  upsert(data: AssociationPolicyDTO): Promise<AssociationPolicyDTO>;
  get(association_id: number): Promise<AssociationPolicyDTO | null>;
}
