import { VehicleAssignment, Prisma } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';

export const VEHICLE_ASSIGNMENT_REPOSITORY = Symbol('VEHICLE_ASSIGNMENT_REPOSITORY');

export type VehicleAssignmentFilter = {
  driver_id?: number;
  vehicle_id?: number;
  active?: boolean;

  // INCLUSIVE window (overlap test). If only one side provided, still inclusive.
  range_start?: Date; // inclusive lower bound (whole-day 00:00:00.000 +03:00)
  range_end?: Date;   // inclusive upper bound (whole-day 23:59:59.999 +03:00)
};

export type VehicleAssignmentView = {
  id: number;
  association_id: number;
  driver_id: number;
  driver_name: string;
  vehicle_id: number;
  plate_number: string;
  active: boolean;
  started_at: Date;
  ended_at: Date | null;
};

export interface IVehicleAssignmentRepository {
  createActive(
    ctx: UserContext,
    data: { driver_id: number; vehicle_id: number; association_id: number; started_at: Date },
    tx?: Prisma.TransactionClient,
  ): Promise<VehicleAssignment>;

  closeActiveForDriver(
    ctx: UserContext,
    driver_id: number,
    ended_at: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;

  findActiveByDriver(ctx: UserContext, driver_id: number): Promise<VehicleAssignment | null>;

  findActiveByDrivers(
    ctx: UserContext,
    driver_ids: number[],
  ): Promise<Array<{ driver_id: number; vehicle_id: number; plate_number: string; started_at: Date }>>;

  // NEW: inclusive overlap window
  search(ctx: UserContext, filter: VehicleAssignmentFilter): Promise<VehicleAssignmentView[]>;
}
