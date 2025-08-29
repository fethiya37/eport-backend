import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Association } from '../../domain/entities/association.entity';
import { ASSOCIATION_REPOSITORY } from 'src/domain/repositories/association.repository';
import type { IAssociationRepository } from 'src/domain/repositories/association.repository';


type CreateAssociationInput = {
  name: string;
  phone_number?: string | null; // 👈 optional
  logo?: string | null;
};

type UpdateAssociationInput = {
  id: number;
  name?: string;
  phone_number?: string | null; // 👈 optional
  logo?: string | null;
  status?: 'ACTIVE' | 'SUSPENDED';
};

@Injectable()
export class AssociationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ASSOCIATION_REPOSITORY) private readonly associations: IAssociationRepository,
  ) { }

  async createAssociation(input: CreateAssociationInput): Promise<Association> {
    return this.associations.create({
      name: input.name,
      phone_number: input.phone_number ?? null, // 👈 set nullable
      logo: input.logo ?? null,
      status: 'ACTIVE', // always ACTIVE on create
    });
  }

  async getById(id: number): Promise<Association> {
    const a = await this.associations.findById(id);
    if (!a) throw new NotFoundException('association not found');
    return a;
  }

  async list(params?: { skip?: number; take?: number }): Promise<Association[]> {
    return this.associations.list(params);
  }

  async updateAssociation(input: UpdateAssociationInput): Promise<Association> {
    const current = await this.associations.findById(input.id);
    if (!current) throw new NotFoundException('association not found');

    const updated = await this.associations.update(input.id, {
      name: input.name,
      phone_number: input.phone_number ?? undefined,
      logo: input.logo ?? undefined,
      status: input.status,
    });

    // If suspended, lock all linked association users
    if (input.status === 'SUSPENDED') {
      await this.prisma.user.updateMany({
        where: { association_id: input.id, user_type: 'Association' },
        data: { is_locked: true },
      });
    }

    return updated;
  }

  async deleteAssociation(id: number): Promise<void> {
    const current = await this.associations.findById(id);
    if (!current) throw new NotFoundException('association not found');

    // lock its users, then delete association (business choice)
    await this.prisma.user.updateMany({
      where: { association_id: id, user_type: 'Association' },
      data: { is_locked: true },
    });

    await this.associations.delete(id);
  }
}
