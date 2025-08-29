import { Owner } from '../entities/owner.entity';

export const OWNER_REPOSITORY = Symbol('OWNER_REPOSITORY');

export interface IOwnerRepository {
  create(data: {
    user_id: number;
    association_id: number;
    full_name: string;
    phone_number: string;
    status: 'ACTIVE' | 'SUSPENDED';
  }): Promise<Owner>;

  findById(id: number): Promise<Owner | null>;

  list(params?: {
    skip?: number;
    take?: number;
    association_id?: number;
    status?: 'ACTIVE' | 'SUSPENDED';
    search?: string; // by name or phone (optional)
  }): Promise<Owner[]>;

  update(id: number, data: {
    association_id?: number;
    full_name?: string;
    phone_number?: string;
    status?: 'ACTIVE' | 'SUSPENDED';
  }): Promise<Owner>;

  delete(id: number): Promise<void>;
}
