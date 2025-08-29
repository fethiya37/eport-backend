import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): User {
    return new User(
      row.id,
      row.phone_number,
      row.user_type,
      row.name ?? null,
      row.association_id ?? null,   // 5th = association_id
      row.password_hash ?? null,    // 6th = password_hash
      row.is_locked,                // 7th = is_locked (BOOLEAN)
      row.created_at,
      row.updated_at,
    );
  }

  async createWithPassword(
    phone_number: string,
    user_type: User['user_type'],
    password_hash: string,
    name: string | null,
    association_id?: number | null,
  ): Promise<User> {
    const row = await this.prisma.user.create({
      data: { phone_number, user_type, password_hash, name, association_id: association_id ?? null },
    });
    return this.toEntity(row);
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByPhone(phone_number: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { phone_number } });
    return row ? this.toEntity(row) : null;
  }

  async updatePassword(id: number, password_hash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { password_hash } });
  }

  async updateUser(
    id: number,
    data: { phone_number?: string; user_type?: User['user_type']; name?: string | null; is_locked?: boolean; association_id?: number | null },
  ): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.phone_number !== undefined ? { phone_number: data.phone_number } : {}),
        ...(data.user_type !== undefined ? { user_type: data.user_type } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.is_locked !== undefined ? { is_locked: data.is_locked } : {}),
        ...(data.association_id !== undefined ? { association_id: data.association_id } : {}),
      },
    });
    return this.toEntity(row);
  }

  async list(params?: { skip?: number; take?: number; association_id?: number }): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      where: params?.association_id ? { association_id: params.association_id } : undefined,
      skip: params?.skip,
      take: params?.take,
      orderBy: { id: 'asc' },
    });
    return rows.map((r) => this.toEntity(r));
  }
}
