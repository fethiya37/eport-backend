import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IAssociationPolicyRepository,
  AssociationPolicyDTO,
} from '../../domain/repositories/association-policy.repository';

@Injectable()
export class PrismaAssociationPolicyRepository implements IAssociationPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: AssociationPolicyDTO): Promise<AssociationPolicyDTO> {
    const row = await this.prisma.associationPolicy.upsert({
      where: { association_id: data.association_id },
      create: {
        association_id: data.association_id,
        weekly_fee: data.weekly_fee as any,
        monthly_fee: data.monthly_fee as any,
        daily_fine_percent: data.daily_fine_percent as any,
      },
      update: {
        weekly_fee: data.weekly_fee as any,
        monthly_fee: data.monthly_fee as any,
        daily_fine_percent: data.daily_fine_percent as any,
      },
    });
    return {
      association_id: row.association_id,
      weekly_fee: Number(row.weekly_fee),
      monthly_fee: Number(row.monthly_fee),
      daily_fine_percent: Number(row.daily_fine_percent),
    };
  }

  async get(association_id: number): Promise<AssociationPolicyDTO | null> {
    const row = await this.prisma.associationPolicy.findUnique({ where: { association_id } });
    if (!row) return null;
    return {
      association_id: row.association_id,
      weekly_fee: Number(row.weekly_fee),
      monthly_fee: Number(row.monthly_fee),
      daily_fine_percent: Number(row.daily_fine_percent),
    };
  }
}
