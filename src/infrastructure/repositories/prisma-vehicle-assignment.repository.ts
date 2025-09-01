import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IVehicleAssignmentRepository } from '../../domain/repositories/vehicle-assignment.repository';
import { VehicleAssignment, Prisma } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class PrismaVehicleAssignmentRepository implements IVehicleAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createActive(
    ctx: UserContext,
    data: { driver_id: number; vehicle_id: number; association_id: number; started_at: Date },
    tx?: Prisma.TransactionClient,
  ): Promise<VehicleAssignment> {
    // (scope checks already done in service)
    const db = tx ?? this.prisma;
    return db.vehicleAssignment.create({
      data: {
        driver_id: data.driver_id,
        vehicle_id: data.vehicle_id,
        association_id: data.association_id,
        started_at: data.started_at,
        active: true,
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
    const db = tx ?? this.prisma;
    const res = await db.vehicleAssignment.updateMany({
      where: { driver_id, active: true },
      data: { active: false, ended_at },
    });
    return res.count;
  }

  async findActiveByDriver(ctx: UserContext, driver_id: number): Promise<VehicleAssignment | null> {
    // read can use main client
    return this.prisma.vehicleAssignment.findFirst({
      where: { driver_id, active: true },
      orderBy: { started_at: 'desc' },
    });
  }
}
