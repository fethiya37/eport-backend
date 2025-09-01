import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IOwnerRepository } from '../../domain/repositories/owner.repository';
import { Owner, OwnerStatus, Prisma } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class PrismaOwnerRepository implements IOwnerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private scopeWhere(ctx: UserContext) {
    if (isAdminLike(ctx.user_type)) return {};
    if (!ctx.association_id) throw new ForbiddenException('Association context required');
    return { association_id: ctx.association_id };
  }

  async create(
    ctx: UserContext,
    data: { association_id: number; full_name: string; phone_number: string; user_id: number },
    tx: Prisma.TransactionClient, // <<< receive tx
  ): Promise<Owner> {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot create owners');
    }
    if (!ctx.association_id || ctx.association_id !== data.association_id) {
      throw new ForbiddenException('Cannot create owner for another association');
    }

    // IMPORTANT: use the SAME transaction client
    return tx.owner.create({
      data: {
        user_id: data.user_id,
        association_id: data.association_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
      },
    });
  }

  async findAll(ctx: UserContext): Promise<Owner[]> {
    return this.prisma.owner.findMany({
      where: this.scopeWhere(ctx),
      orderBy: { id: 'asc' },
      include: { user: true, association: true },
    });
  }

  async findById(ctx: UserContext, id: number): Promise<Owner | null> {
    const owner = await this.prisma.owner.findUnique({
      where: { id },
      include: { user: true, association: true },
    });
    if (!owner) return null;

    if (!isAdminLike(ctx.user_type)) {
      if (!ctx.association_id || owner.association_id !== ctx.association_id) {
        throw new ForbiddenException('Not in your association');
      }
    }
    return owner;
  }

  async update(
    ctx: UserContext,
    id: number,
    data: Partial<{ full_name: string; phone_number: string; status: OwnerStatus }>
  ): Promise<Owner> {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot update owners');
    }
    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Owner not found');

    return this.prisma.owner.update({
      where: { id },
      data,
      include: { user: true, association: true },
    });
  }
}
