import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Owner } from '../../domain/entities/owner.entity';
import type { IOwnerRepository } from '../../domain/repositories/owner.repository';

@Injectable()
export class PrismaOwnerRepository implements IOwnerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(r: any): Owner {
    return new Owner(
      r.id,
      r.user_id,
      r.association_id,
      r.full_name,
      r.phone_number,
      r.status,
      r.created_at,
      r.updated_at,
    );
  }

  async create(data: {
    user_id: number;
    association_id: number;
    full_name: string;
    phone_number: string;
    status: 'ACTIVE' | 'SUSPENDED';
  }): Promise<Owner> {
    const row = await this.prisma.owner.create({ data });
    return this.toEntity(row);
  }

  async findById(id: number): Promise<Owner | null> {
    const row = await this.prisma.owner.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async list(params?: {
    skip?: number;
    take?: number;
    association_id?: number;
    status?: 'ACTIVE' | 'SUSPENDED';
    search?: string;
  }): Promise<Owner[]> {
    const rows = await this.prisma.owner.findMany({
      where: {
        association_id: params?.association_id,
        status: params?.status,
        OR: params?.search
          ? [
              { full_name: { contains: params.search, mode: 'insensitive' } },
              { phone_number: { contains: params.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: { id: 'asc' },
    });
    return rows.map(this.toEntity.bind(this));
  }

  async update(
    id: number,
    data: { association_id?: number; full_name?: string; phone_number?: string; status?: 'ACTIVE' | 'SUSPENDED' },
  ): Promise<Owner> {
    const row = await this.prisma.owner.update({ where: { id }, data });
    return this.toEntity(row);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.owner.delete({ where: { id } });
  }
}
