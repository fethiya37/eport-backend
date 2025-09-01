import { Association, AssociationStatus } from '@prisma/client';

export const ASSOCIATION_REPOSITORY = Symbol('ASSOCIATION_REPOSITORY');

export type AssociationFilter = {
  id?: number;
  name?: string;
  status?: AssociationStatus;
};

export interface IAssociationRepository {
  create(data: {
    name: string;
    phone_number?: string | null;
    logo?: string | null;
  }): Promise<Association>;

  findAll(filter?: AssociationFilter): Promise<Association[]>;
  findById(id: number): Promise<Association | null>;

  update(id: number, data: Partial<{
    name: string;
    phone_number: string | null;
    logo: string | null;
    status: AssociationStatus;
  }>): Promise<Association>;
}
