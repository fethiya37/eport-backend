import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IDriverRepository, DriverFilter } from '../../domain/repositories/driver.repository';
import { Driver, Prisma } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class PrismaDriverRepository implements IDriverRepository {
  constructor(private readonly prisma: PrismaService) {}

  private scopeWhere(ctx: UserContext): Prisma.DriverWhereInput {
    if (isAdminLike(ctx.user_type)) return {};
    if (!ctx.association_id) throw new ForbiddenException('Association context required');
    return { association_id: ctx.association_id };
  }

  async create(
    ctx: UserContext,
    data: {
      user_id: number;
      association_id: number;
      full_name: string;
      phone_number: string;
      license_no?: string | null;
      license_expiry?: Date | null;
    },
    tx: Prisma.TransactionClient, // <<< receive tx
  ): Promise<Driver> {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create drivers');
    if (!ctx.association_id || ctx.association_id !== data.association_id) {
      throw new ForbiddenException('Cannot create driver for another association');
    }
    // IMPORTANT: use the SAME transaction client
    return tx.driver.create({
      data: {
        user_id: data.user_id,
        association_id: data.association_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
        license_no: data.license_no ?? null,
        license_expiry: data.license_expiry ?? null,
      },
    });
  }

  async findAll(ctx: UserContext, filter?: DriverFilter): Promise<Driver[]> {
    const where: Prisma.DriverWhereInput = {
      ...this.scopeWhere(ctx),
      ...(filter?.id ? { id: filter.id } : {}),
      ...(filter?.full_name ? { full_name: { contains: filter.full_name, mode: 'insensitive' } } : {}),
      ...(filter?.phone_number ? { phone_number: filter.phone_number } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.license_no ? { license_no: { contains: filter.license_no, mode: 'insensitive' } } : {}),
    };
    return this.prisma.driver.findMany({ where, orderBy: { id: 'asc' } });
  }

  async findById(ctx: UserContext, id: number): Promise<Driver | null> {
    const d = await this.prisma.driver.findUnique({ where: { id } });
    if (!d) return null;
    if (!isAdminLike(ctx.user_type)) {
      if (!ctx.association_id || d.association_id !== ctx.association_id) {
        throw new ForbiddenException('Not in your association');
      }
    }
    return d;
  }

  async update(ctx: UserContext, id: number, data: Partial<Driver>): Promise<Driver> {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot update drivers');
    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Driver not found');
    return this.prisma.driver.update({ where: { id }, data });
  }
}
