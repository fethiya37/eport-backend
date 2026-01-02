import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IAssociationSubaccountRepository } from '../../domain/repositories/association-subaccount.repository';
import { AssociationSubaccount, Prisma } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';

@Injectable()
export class PrismaAssociationSubaccountRepository implements IAssociationSubaccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  private ensureScope(ctx: UserContext, association_id: number) {
    if (isAdminLike(ctx.user_type)) return;
    if (!ctx.association_id || ctx.association_id !== association_id) {
      throw new ForbiddenException('Not your association');
    }
  }

  async create(
    ctx: UserContext,
    data: {
      association_id: number;
      chapa_id: string;
      business_name: string;
      account_name: string;
      account_number: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<AssociationSubaccount> {
    this.ensureScope(ctx, data.association_id);

    const client = tx ?? this.prisma;
    return client.associationSubaccount.create({ data });
  }

  async findByAssociationId(
    ctx: UserContext,
    association_id: number,
  ): Promise<AssociationSubaccount | null> {
    this.ensureScope(ctx, association_id);
    return this.prisma.associationSubaccount.findUnique({ where: { association_id } });
  }

  async findById(ctx: UserContext, id: number): Promise<AssociationSubaccount | null> {
    const row = await this.prisma.associationSubaccount.findUnique({ where: { id } });
    if (!row) return null;
    this.ensureScope(ctx, row.association_id);
    return row;
  }

  async hardDelete(ctx: UserContext, id: number): Promise<void> {
    const row = await this.prisma.associationSubaccount.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('subaccount not found');
    this.ensureScope(ctx, row.association_id);
    await this.prisma.associationSubaccount.delete({ where: { id } });
  }
}
