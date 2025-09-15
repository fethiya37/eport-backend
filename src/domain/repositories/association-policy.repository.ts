export const ASSOCIATION_POLICY_REPOSITORY = Symbol('ASSOCIATION_POLICY_REPOSITORY');

export type AssociationPolicyDTO = {
  association_id: number;
  weekly_fee: number;          // ETB
  monthly_fee: number;         // ETB
  daily_fine_percent: number;  // e.g. 0.20 for 20% per day
};

export interface IAssociationPolicyRepository {
  upsert(data: AssociationPolicyDTO): Promise<AssociationPolicyDTO>;
  get(association_id: number): Promise<AssociationPolicyDTO | null>;
}
