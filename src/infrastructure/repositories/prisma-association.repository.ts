import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Association } from '../../domain/entities/association.entity';
import type { IAssociationRepository } from '../../domain/repositories/association.repository';

@Injectable()
export class PrismaAssociationRepository implements IAssociationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(r: any): Association {
    return new Association(
      r.id,
      r.name,
      r.phone_number ?? null,   // 👈
      r.logo ?? null,
      r.status,
      r.created_at,
      r.updated_at,
    );
  }

  async create(data: {
    name: string;
    phone_number: string | null;
    logo: string | null;
    status: 'ACTIVE' | 'SUSPENDED';
  }): Promise<Association> {
    const row = await this.prisma.association.create({ data });
    return this.toEntity(row);
  }

  async findById(id: number): Promise<Association | null> {
    const row = await this.prisma.association.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async list(params?: { skip?: number; take?: number }): Promise<Association[]> {
    const rows = await this.prisma.association.findMany({
      skip: params?.skip,
      take: params?.take,
      orderBy: { id: 'asc' },
    });
    return rows.map(this.toEntity.bind(this));
  }

  async update(
    id: number,
    data: { name?: string; phone_number?: string | null; logo?: string | null; status?: 'ACTIVE' | 'SUSPENDED' },
  ): Promise<Association> {
    const row = await this.prisma.association.update({ where: { id }, data });
    return this.toEntity(row);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.association.delete({ where: { id } });
  }
}
