import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
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
      has_smartphone?: boolean;
    },
    tx: Prisma.TransactionClient,
  ): Promise<Driver> {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot create drivers');
    }
    if (!ctx.association_id || ctx.association_id !== data.association_id) {
      throw new ForbiddenException('Cannot create driver for another association');
    }

    const fullName = data.full_name.trim();
    const phone = data.phone_number.trim();
    const licenseNo = data.license_no === undefined ? undefined : (data.license_no ?? null);
    const licenseNoTrimmed = typeof licenseNo === 'string' ? licenseNo.trim() : licenseNo;

    return tx.driver.create({
      data: {
        user_id: data.user_id,
        association_id: data.association_id,
        full_name: fullName,
        phone_number: phone,
        license_no: licenseNoTrimmed,
        license_expiry: data.license_expiry ?? null,
        has_smartphone: data.has_smartphone ?? true,
      },
    });
  }

  async findAll(ctx: UserContext, filter?: DriverFilter): Promise<Driver[]> {
    const baseScope = this.scopeWhere(ctx);

    const fullName = filter?.full_name?.trim();
    const phone = filter?.phone_number?.trim();
    const licenseNo = filter?.license_no?.trim();

    const where: Prisma.DriverWhereInput = {
      ...baseScope,
      ...(isAdminLike(ctx.user_type) && filter?.association_id
        ? { association_id: filter.association_id }
        : {}),
      ...(filter?.id ? { id: filter.id } : {}),
      ...(fullName ? { full_name: { contains: fullName, mode: 'insensitive' } } : {}),
      ...(phone ? { phone_number: phone } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(licenseNo ? { license_no: { contains: licenseNo, mode: 'insensitive' } } : {}),
      ...(filter?.has_smartphone !== undefined ? { has_smartphone: filter.has_smartphone } : {}),
    };

    return this.prisma.driver.findMany({ where, orderBy: { id: 'asc' } });
  }

  async findById(ctx: UserContext, id: number): Promise<Driver | null> {
    const d = await this.prisma.driver.findUnique({ where: { id } });
    if (!d) return null;

    if (!isAdminLike(ctx.user_type) && ctx.user_type !== 'Driver') {
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
      has_smartphone: boolean;

      active_until_date: Date | null;
      payment_status: 'ACTIVE' | 'INACTIVE';

      interest_accrued: number;
      last_accrual_date: Date | null;
      last_accrual_amount: number | null;
    }>,
  ): Promise<Driver> {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot update drivers');
    }

    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Driver not found');

    const updateData: Prisma.DriverUpdateInput = {
      ...(data.full_name !== undefined ? { full_name: data.full_name.trim() } : {}),
      ...(data.phone_number !== undefined ? { phone_number: data.phone_number.trim() } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.license_no !== undefined
        ? { license_no: typeof data.license_no === 'string' ? data.license_no.trim() : data.license_no }
        : {}),
      ...(data.license_expiry !== undefined ? { license_expiry: data.license_expiry } : {}),
      ...(data.has_smartphone !== undefined ? { has_smartphone: data.has_smartphone } : {}),
      ...(data.active_until_date !== undefined ? { active_until_date: data.active_until_date } : {}),
      ...(data.payment_status !== undefined ? { payment_status: data.payment_status as any } : {}),
      ...(data.interest_accrued !== undefined ? { interest_accrued: data.interest_accrued as any } : {}),
      ...(data.last_accrual_date !== undefined ? { last_accrual_date: data.last_accrual_date } : {}),
      ...(data.last_accrual_amount !== undefined ? { last_accrual_amount: data.last_accrual_amount as any } : {}),
    };

    return this.prisma.driver.update({ where: { id }, data: updateData });
  }

  async remove(ctx: UserContext, id: number, tx: Prisma.TransactionClient): Promise<Driver> {
    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Driver not found');
    return tx.driver.delete({ where: { id } });
  }

  async findWithoutVehicle(ctx: UserContext): Promise<Driver[]> {
    const baseScope = this.scopeWhere(ctx);

    return this.prisma.driver.findMany({
      where: {
        ...baseScope,
        vehicle: null,
      },
      orderBy: { id: 'asc' },
    });
  }
}
