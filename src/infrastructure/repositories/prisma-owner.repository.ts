import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IOwnerRepository } from '../../domain/repositories/owner.repository';
import { Owner, Prisma } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class PrismaOwnerRepository implements IOwnerRepository {
  constructor(private readonly prisma: PrismaService) { }

  private scopeWhere(ctx: UserContext) {
    if (isAdminLike(ctx.user_type)) return {};
    if (!ctx.association_id) throw new ForbiddenException('Association context required');
    return { association_id: ctx.association_id };
  }

  async create(
    ctx: UserContext,
    data: { association_id: number; full_name: string; phone_number: string },
    tx: Prisma.TransactionClient,
  ): Promise<Owner> {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot create owners');
    }
    if (!ctx.association_id || ctx.association_id !== data.association_id) {
      throw new ForbiddenException('Cannot create owner for another association');
    }

    return tx.owner.create({
      data: {
        association_id: data.association_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
      },
    });
  }

  async findAll(ctx: UserContext, association_id?: number): Promise<Owner[]> {
    const where =
      isAdminLike(ctx.user_type)
        ? association_id
          ? { association_id }
          : {}
        : this.scopeWhere(ctx);

    return this.prisma.owner.findMany({
      where,
      orderBy: { id: 'asc' },
      include: { association: true },
    });
  }

  async findById(ctx: UserContext, id: number): Promise<Owner | null> {
    const owner = await this.prisma.owner.findUnique({
      where: { id },
      include: { association: true },
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
    data: Partial<{ full_name: string; phone_number: string }>,
  ): Promise<Owner> {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot update owners');
    }
    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Owner not found');

    return this.prisma.owner.update({
      where: { id },
      data,
      include: { association: true },
    });
  }

  async remove(ctx: UserContext, id: number): Promise<Owner> {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot delete owners');
    }
    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Owner not found');

    return this.prisma.owner.delete({
      where: { id },
      include: { association: true },
    });
  }
}
