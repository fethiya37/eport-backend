import { Driver } from '../entities/driver.entity';

export const DRIVER_REPOSITORY = Symbol('DRIVER_REPOSITORY');

export interface IDriverRepository {
  create(data: {
    user_id: number;
    association_id: number;
    full_name: string;
    license_no?: string | null;
    license_expiry?: Date | null;
    phone_number: string;
    status?: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
  }): Promise<Driver>;

  findById(id: number): Promise<Driver | null>;

  list(params: {
    association_id: number;
    skip?: number;
    take?: number;
    status?: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
    search?: string; // name/phone/license
  }): Promise<Driver[]>;

  update(id: number, data: {
    full_name?: string;
    license_no?: string | null;
    license_expiry?: Date | null;
    phone_number?: string;
    status?: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
  }): Promise<Driver>;

  delete(id: number): Promise<void>;
}
