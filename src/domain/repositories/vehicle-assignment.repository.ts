import { VehicleAssignment, Prisma } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';

export const VEHICLE_ASSIGNMENT_REPOSITORY = Symbol('VEHICLE_ASSIGNMENT_REPOSITORY');

export interface IVehicleAssignmentRepository {
  createActive(
    ctx: UserContext,
    data: { driver_id: number; vehicle_id: number; association_id: number; started_at: Date },
    tx?: Prisma.TransactionClient, // <<< optional tx
  ): Promise<VehicleAssignment>;

  closeActiveForDriver(
    ctx: UserContext,
    driver_id: number,
    ended_at: Date,
    tx?: Prisma.TransactionClient, // <<< optional tx
  ): Promise<number>;

  findActiveByDriver(ctx: UserContext, driver_id: number): Promise<VehicleAssignment | null>;
}
