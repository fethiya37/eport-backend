import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  createWithPassword(
    phone_number: string,
    user_type: User['user_type'],
    password_hash: string,
    name: string | null,
    association_id?: number | null,
  ): Promise<User>;

  findById(id: number): Promise<User | null>;
  findByPhone(phone_number: string): Promise<User | null>;

  updatePassword(id: number, password_hash: string): Promise<void>;

  updateUser(
    id: number,
    data: {
      phone_number?: string;
      user_type?: User['user_type'];
      name?: string | null;
      is_locked?: boolean;
      association_id?: number | null;
    },
  ): Promise<User>;

  list(params?: { skip?: number; take?: number; association_id?: number }): Promise<User[]>;
}
