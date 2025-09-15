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
      is_weekly?: boolean;
    },
    tx: Prisma.TransactionClient,
  ): Promise<Driver> {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create drivers');
    if (!ctx.association_id || ctx.association_id !== data.association_id) {
      throw new ForbiddenException('Cannot create driver for another association');
    }
    return tx.driver.create({
      data: {
        user_id: data.user_id,
        association_id: data.association_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
        license_no: data.license_no ?? null,
        license_expiry: data.license_expiry ?? null,
        is_weekly: data.is_weekly ?? false,
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

  async update(
    ctx: UserContext,
    id: number,
    data: Partial<{
      full_name: string;
      phone_number: string;
      status: Driver['status'];
      license_no: string | null;
      license_expiry: Date | null;
      is_weekly: boolean;

      // payment / coverage fields
      active_until_date: Date | null;
      payment_status: 'ACTIVE' | 'INACTIVE';

      // interest fields
      interest_accrued: number;
      last_accrual_date: Date | null;
      last_accrual_amount: number | null;
    }>
  ): Promise<Driver> {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot update drivers');
    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Driver not found');

    const updateData: Prisma.DriverUpdateInput = {
      ...(data.full_name !== undefined ? { full_name: data.full_name } : {}),
      ...(data.phone_number !== undefined ? { phone_number: data.phone_number } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.license_no !== undefined ? { license_no: data.license_no } : {}),
      ...(data.license_expiry !== undefined ? { license_expiry: data.license_expiry } : {}),
      ...(data.is_weekly !== undefined ? { is_weekly: data.is_weekly } : {}),

      ...(data.active_until_date !== undefined ? { active_until_date: data.active_until_date } : {}),
      ...(data.payment_status !== undefined ? { payment_status: data.payment_status as any } : {}),

      ...(data.interest_accrued !== undefined ? { interest_accrued: data.interest_accrued as any } : {}),
      ...(data.last_accrual_date !== undefined ? { last_accrual_date: data.last_accrual_date } : {}),
      ...(data.last_accrual_amount !== undefined ? { last_accrual_amount: data.last_accrual_amount as any } : {}),
    };

    return this.prisma.driver.update({ where: { id }, data: updateData });
  }
}
