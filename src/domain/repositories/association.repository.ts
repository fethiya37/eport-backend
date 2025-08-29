import { Association } from '../entities/association.entity';

export const ASSOCIATION_REPOSITORY = Symbol('ASSOCIATION_REPOSITORY');

export interface IAssociationRepository {
  create(data: {
    name: string;
    phone_number: string | null;  // 👈
    logo: string | null;
    status: 'ACTIVE' | 'SUSPENDED';
  }): Promise<Association>;

  findById(id: number): Promise<Association | null>;
  list(params?: { skip?: number; take?: number }): Promise<Association[]>;

  update(id: number, data: {
    name?: string;
    phone_number?: string | null; // 👈
    logo?: string | null;
    status?: 'ACTIVE' | 'SUSPENDED';
  }): Promise<Association>;

  delete(id: number): Promise<void>;
}
