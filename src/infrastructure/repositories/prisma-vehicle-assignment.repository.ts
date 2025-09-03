import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IVehicleAssignmentRepository,
  VehicleAssignmentFilter,
  VehicleAssignmentView,
} from '../../domain/repositories/vehicle-assignment.repository';
import { VehicleAssignment, Prisma } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';
import { isAdminLike } from '../../common/auth/roles.util';

@Injectable()
export class PrismaVehicleAssignmentRepository implements IVehicleAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createActive(
    ctx: UserContext,
    data: { driver_id: number; vehicle_id: number; association_id: number; started_at: Date },
    tx?: Prisma.TransactionClient,
  ): Promise<VehicleAssignment> {
    const client = tx ?? this.prisma;
    return client.vehicleAssignment.create({
      data: {
        driver_id: data.driver_id,
        vehicle_id: data.vehicle_id,
        association_id: data.association_id,
        active: true,
        started_at: data.started_at,
        ended_at: null,
      },
    });
  }

  async closeActiveForDriver(
    ctx: UserContext,
    driver_id: number,
    ended_at: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx ?? this.prisma;
    const where: Prisma.VehicleAssignmentWhereInput = {
      driver_id,
      active: true,
      ...(isAdminLike(ctx.user_type) ? {} : { association_id: ctx.association_id ?? undefined }),
    };
    const res = await client.vehicleAssignment.updateMany({
      where,
      data: { active: false, ended_at },
    });
    return res.count;
  }

  async findActiveByDriver(ctx: UserContext, driver_id: number): Promise<VehicleAssignment | null> {
    const where: Prisma.VehicleAssignmentWhereInput = {
      driver_id,
      active: true,
      ...(isAdminLike(ctx.user_type) ? {} : { association_id: ctx.association_id ?? undefined }),
    };
    return this.prisma.vehicleAssignment.findFirst({
      where,
      orderBy: { started_at: 'desc' },
    });
  }

  async findActiveByDrivers(
    ctx: UserContext,
    driver_ids: number[],
  ): Promise<Array<{ driver_id: number; vehicle_id: number; plate_number: string; started_at: Date }>> {
    if (driver_ids.length === 0) return [];

    const where: Prisma.VehicleAssignmentWhereInput = {
      driver_id: { in: driver_ids },
      active: true,
      ...(isAdminLike(ctx.user_type) ? {} : { association_id: ctx.association_id ?? undefined }),
    };

    const rows = await this.prisma.vehicleAssignment.findMany({
      where,
      include: { vehicle: { select: { id: true, plate_number: true } } },
      orderBy: { started_at: 'desc' },
    });

    const seen = new Set<number>();
    const result: Array<{ driver_id: number; vehicle_id: number; plate_number: string; started_at: Date }> = [];
    for (const r of rows) {
      if (seen.has(r.driver_id)) continue;
      seen.add(r.driver_id);
      result.push({
        driver_id: r.driver_id,
        vehicle_id: r.vehicle_id,
        plate_number: r.vehicle.plate_number,
        started_at: r.started_at,
      });
    }
    return result;
  }

  async search(ctx: UserContext, f: VehicleAssignmentFilter): Promise<VehicleAssignmentView[]> {
    const overlap =
      f.range_start || f.range_end
        ? {
            NOT: {
              OR: [
                ...(f.range_start ? [{ ended_at: { lt: f.range_start } }] : []),
                ...(f.range_end ? [{ started_at: { gt: f.range_end } }] : []),
              ],
            },
          }
        : {};

    const where: Prisma.VehicleAssignmentWhereInput = {
      ...(isAdminLike(ctx.user_type) ? {} : { association_id: ctx.association_id ?? undefined }),
      ...(f.driver_id ? { driver_id: f.driver_id } : {}),
      ...(f.vehicle_id ? { vehicle_id: f.vehicle_id } : {}),
      ...(typeof f.active === 'boolean' ? { active: f.active } : {}),
      ...overlap,
    };

    const rows = await this.prisma.vehicleAssignment.findMany({
      where,
      include: {
        driver: { select: { id: true, full_name: true } },
        vehicle: { select: { id: true, plate_number: true } },
      },
      orderBy: { started_at: 'desc' },
    });

    return rows.map((r) => ({
      id: r.id,
      association_id: r.association_id,
      driver_id: r.driver_id,
      driver_name: r.driver.full_name,
      vehicle_id: r.vehicle_id,
      plate_number: r.vehicle.plate_number,
      active: r.active,
      started_at: r.started_at,
      ended_at: r.ended_at ?? null,
    }));
  }

  // ✅ NEW: required by the interface
  async isActivePair(
    association_id: number,
    driver_id: number,
    vehicle_id: number,
  ): Promise<boolean> {
    const row = await this.prisma.vehicleAssignment.findFirst({
      where: { association_id, driver_id, vehicle_id, active: true },
      select: { id: true },
    });
    return !!row;
  }
}
