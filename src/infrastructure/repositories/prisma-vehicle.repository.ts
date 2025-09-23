import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IVehicleRepository, VehicleFilter } from '../../domain/repositories/vehicle.repository';
import { Vehicle, Prisma, VehicleStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaService) { }

  private scopeWhere(ctx: UserContext): Prisma.VehicleWhereInput {
    if (isAdminLike(ctx.user_type)) return {};
    if (!ctx.association_id) throw new ForbiddenException('Association context required');
    return { association_id: ctx.association_id };
  }

  async create(ctx: UserContext, data: {
    plate_number: string;
    libre_no?: string | null;
    owner_id: number;
    association_id: number;
    make?: string | null;
    model?: string | null;
    color?: string | null;
    capacity?: number | null;
  }): Promise<Vehicle> {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create vehicles');
    if (!ctx.association_id || ctx.association_id !== data.association_id) {
      throw new ForbiddenException('Cannot create vehicle for another association');
    }

    const owner = await this.prisma.owner.findUnique({ where: { id: data.owner_id } });
    if (!owner || owner.association_id !== data.association_id) {
      throw new BadRequestException('Owner not found in your association');
    }

    return this.prisma.vehicle.create({
      data: {
        plate_number: data.plate_number,
        libre_no: data.libre_no ?? null,
        owner_id: data.owner_id,
        association_id: data.association_id,
        make: data.make ?? null,
        model: data.model ?? null,
        color: data.color ?? null,
        capacity: data.capacity ?? null,
        status: VehicleStatus.ACTIVE,
      },
    });
  }

  async findAll(ctx: UserContext, filter?: VehicleFilter): Promise<Vehicle[]> {
    const baseScope = this.scopeWhere(ctx);

    // allow Admin/Superadmin to filter by association_id
    const where: Prisma.VehicleWhereInput = {
      ...baseScope,
      ...(isAdminLike(ctx.user_type) && filter?.association_id
        ? { association_id: filter.association_id }
        : {}),
      ...(filter?.id ? { id: filter.id } : {}),
      ...(filter?.plate_number ? { plate_number: filter.plate_number } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.owner_id ? { owner_id: filter.owner_id } : {}),
      ...(filter?.make ? { make: { contains: filter.make, mode: 'insensitive' } } : {}),
      ...(filter?.model ? { model: { contains: filter.model, mode: 'insensitive' } } : {}),
      ...(filter?.color ? { color: { contains: filter.color, mode: 'insensitive' } } : {}),
    };

    return this.prisma.vehicle.findMany({
      where,
      orderBy: { id: 'asc' },
      include: { association: true, owner: true },
    });
  }

  async findById(ctx: UserContext, id: number): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) return null;

    if (!isAdminLike(ctx.user_type)) {
      if (!ctx.association_id || vehicle.association_id !== ctx.association_id) {
        throw new ForbiddenException('Not in your association');
      }
    }
    return vehicle;
  }

  async findActiveWithoutDriver(ctx: UserContext): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: {
        ...this.scopeWhere(ctx),
        status: VehicleStatus.ACTIVE,
        assignments: { none: { active: true } },
      },
      include: { association: true, owner: true },
    });
  }

  async update(
    ctx: UserContext,
    id: number,
    data: Partial<{
      plate_number: string;
      libre_no: string | null;
      owner_id: number;
      make: string | null;
      model: string | null;
      color: string | null;
      capacity: number | null;
      status: VehicleStatus;
    }>
  ): Promise<Vehicle> {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot update vehicles');

    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    if (data.owner_id) {
      const owner = await this.prisma.owner.findUnique({ where: { id: data.owner_id } });
      if (!owner || owner.association_id !== existing.association_id) {
        throw new BadRequestException('Owner must belong to the same association');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.plate_number !== undefined ? { plate_number: data.plate_number } : {}),
        ...(data.libre_no !== undefined ? { libre_no: data.libre_no } : {}),
        ...(data.owner_id !== undefined ? { owner_id: data.owner_id } : {}),
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.model !== undefined ? { model: data.model } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
  }
}
