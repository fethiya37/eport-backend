import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IAssociationRepository,
  AssociationFilter,
} from '../../domain/repositories/association.repository';
import { Association, Prisma } from '@prisma/client';

@Injectable()
export class PrismaAssociationRepository implements IAssociationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    phone_number?: string | null;
    logo?: string | null;
  }): Promise<Association> {
    return this.prisma.association.create({
      data: {
        name: data.name,
        phone_number: data.phone_number ?? null,
        logo: data.logo ?? null,
      },
    });
  }

  async findAll(filter?: AssociationFilter): Promise<Association[]> {
    const where: Prisma.AssociationWhereInput = {
      ...(filter?.id ? { id: filter.id } : {}),
      ...(filter?.name
        ? { name: { contains: filter.name, mode: 'insensitive' } }
        : {}),
    };
    return this.prisma.association.findMany({ where, orderBy: { id: 'asc' } });
  }

  findById(id: number): Promise<Association | null> {
    return this.prisma.association.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<Association>): Promise<Association> {
    try {
      return await this.prisma.association.update({ where: { id }, data });
    } catch (e: any) {
      if (e.code === 'P2025')
        throw new NotFoundException('Association not found');
      throw e;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.association.count({ where: { id } });
    return count > 0;
  }
}
