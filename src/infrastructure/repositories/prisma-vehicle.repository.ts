import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
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

  async create(
    ctx: UserContext,
    data: {
      plate_number: string;
      libre_no?: string | null;
      owner_id: number;
      association_id: number;
      driver_id?: number | null;
      make?: string | null;
      model?: string | null;
      color?: string | null;
      capacity?: number | null;
      is_weekly: boolean;
    },
  ): Promise<Vehicle> {
    if (isAdminLike(ctx.user_type))
      throw new ForbiddenException('Admin/Superadmin cannot create vehicles');
    if (!ctx.association_id || ctx.association_id !== data.association_id) {
      throw new ForbiddenException('Cannot create vehicle for another association');
    }

    const owner = await this.prisma.owner.findUnique({ where: { id: data.owner_id } });
    if (!owner || owner.association_id !== data.association_id) {
      throw new BadRequestException('Owner not found in your association');
    }

    if (data.driver_id) {
      const driver = await this.prisma.driver.findUnique({ where: { id: data.driver_id } });
      if (!driver || driver.association_id !== data.association_id) {
        throw new BadRequestException('Driver not found in your association');
      }
    }

    return this.prisma.vehicle.create({
      data: {
        plate_number: data.plate_number,
        libre_no: data.libre_no ?? null,
        owner_id: data.owner_id,
        association_id: data.association_id,
        driver_id: data.driver_id ?? null,
        make: data.make ?? null,
        model: data.model ?? null,
        color: data.color ?? null,
        capacity: data.capacity ?? null,
        status: VehicleStatus.ACTIVE,
        is_weekly: data.is_weekly, // ✅ now persisted
      },
    });
  }

  async findAll(ctx: UserContext, filter?: VehicleFilter): Promise<Vehicle[]> {
    const baseScope = this.scopeWhere(ctx);

    const where: Prisma.VehicleWhereInput = {
      ...baseScope,
      ...(isAdminLike(ctx.user_type) && filter?.association_id
        ? { association_id: filter.association_id }
        : {}),
      ...(filter?.id ? { id: filter.id } : {}),
      ...(filter?.plate_number ? { plate_number: filter.plate_number } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.owner_id ? { owner_id: filter.owner_id } : {}),
      ...(filter?.driver_id ? { driver_id: filter.driver_id } : {}),
      ...(filter?.make ? { make: { contains: filter.make, mode: 'insensitive' } } : {}),
      ...(filter?.model ? { model: { contains: filter.model, mode: 'insensitive' } } : {}),
      ...(filter?.color ? { color: { contains: filter.color, mode: 'insensitive' } } : {}),
    };

    return this.prisma.vehicle.findMany({
      where,
      orderBy: { id: 'asc' },
      include: { association: true, owner: true, driver: true },
    });
  }

  async findById(ctx: UserContext, id: number): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { association: true, owner: true, driver: true },
    });
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
        driver_id: null,
      },
      include: { association: true, owner: true },
    });
  }

  async update(
    ctx: UserContext,
    id: number,
    data: Partial<{
      plate_number: string | null;
      libre_no: string | null;
      owner_id: number;
      driver_id: number | null;
      make: string | null;
      model: string | null;
      color: string | null;
      capacity: number | null;
      status: VehicleStatus;
      is_weekly: boolean;
    }>,
  ): Promise<Vehicle> {
    if (isAdminLike(ctx.user_type))
      throw new ForbiddenException('Admin/Superadmin cannot update vehicles');

    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    if (data.owner_id) {
      const owner = await this.prisma.owner.findUnique({ where: { id: data.owner_id } });
      if (!owner || owner.association_id !== existing.association_id) {
        throw new BadRequestException('Owner must belong to the same association');
      }
    }

    if (data.driver_id) {
      const driver = await this.prisma.driver.findUnique({ where: { id: data.driver_id } });
      if (!driver || driver.association_id !== existing.association_id) {
        throw new BadRequestException('Driver must belong to the same association');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.plate_number !== undefined ? { plate_number: data.plate_number } : {}),
        ...(data.libre_no !== undefined ? { libre_no: data.libre_no } : {}),
        ...(data.owner_id !== undefined ? { owner_id: data.owner_id } : {}),
        ...(data.driver_id !== undefined ? { driver_id: data.driver_id } : {}),
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.model !== undefined ? { model: data.model } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.is_weekly !== undefined ? { is_weekly: data.is_weekly } : {}), // ✅ update weekly
      } as Prisma.VehicleUncheckedUpdateInput,
      include: { association: true, owner: true, driver: true },
    });
  }

  async remove(ctx: UserContext, id: number): Promise<Vehicle> {
    const existing = await this.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    return this.prisma.vehicle.delete({
      where: { id },
      include: { association: true, owner: true, driver: true },
    });
  }


  async findAvailableForQuotaOrDirect(
    ctx: UserContext,
    input: { association_id?: number; is_weekly: boolean; start_date: Date; mode: 'quota' | 'direct' }
  ): Promise<{ count: number; vehicles?: Vehicle[] }> {
    const assocId = isAdminLike(ctx.user_type)
      ? input.association_id
      : ctx.association_id;

    if (!assocId) throw new BadRequestException('association_id is required');

    // 1. Candidate vehicles
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        association_id: assocId,
        status: VehicleStatus.ACTIVE,
        is_weekly: input.is_weekly,
        driver_id: { not: null },
      },
      include: input.mode === 'direct' ? { driver: true } : undefined,
    });

    // 2. Filter out vehicles with overlapping assignments
    const available: typeof vehicles = [];
    for (const v of vehicles) {
      const latest = await this.prisma.routeAssignment.findFirst({
        where: {
          vehicle_id: v.id,
          association_id: assocId,
          status: { in: ['Pending', 'Approved'] },
        },
        orderBy: { end_date: 'desc' },
      });

      if (!latest || latest.end_date < input.start_date) {
        available.push(v);
      }
    }

    // 3. Return based on mode
    if (input.mode === 'quota') {
      return { count: available.length };
    }
    return { count: available.length, vehicles: available };
  }

}
