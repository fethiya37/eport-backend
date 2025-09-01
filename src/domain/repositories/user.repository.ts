import { User, UserType } from '@prisma/client';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type UserFilter = {
  id?: number;
  phone_number?: string;
  user_type?: UserType;
  name?: string;
  is_locked?: boolean;
  association_id?: number; // filtering by an id (not null)
};

export interface IUserRepository {
  create(data: {
    phone_number: string;
    user_type: UserType;
    name?: string | null;
    association_id: number | null; // <-- allow null here
    password_hash: string;
  }): Promise<User>;

  findAll(filter?: UserFilter): Promise<User[]>;
  findById(id: number): Promise<User | null>;

  update(id: number, data: Partial<{
    phone_number: string;
    user_type: UserType;
    name: string | null;
    is_locked: boolean;
    association_id: number | null; // <-- allow null here
    password_hash: string | null;
  }>): Promise<User>;

}
