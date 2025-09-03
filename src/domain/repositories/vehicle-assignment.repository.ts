// src/domain/repositories/vehicle-assignment.repository.ts
import { VehicleAssignment, Prisma } from '@prisma/client';
import { UserContext } from 'src/common/context/user-context';

export const VEHICLE_ASSIGNMENT_REPOSITORY = Symbol('VEHICLE_ASSIGNMENT_REPOSITORY');

export type VehicleAssignmentFilter = {
  driver_id?: number;
  vehicle_id?: number;
  active?: boolean;
  range_start?: Date;
  range_end?: Date;
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

  closeActiveForDriver(ctx: UserContext, driver_id: number, ended_at: Date, tx?: Prisma.TransactionClient): Promise<number>;
  findActiveByDriver(ctx: UserContext, driver_id: number): Promise<VehicleAssignment | null>;
  findActiveByDrivers(
    ctx: UserContext,
    driver_ids: number[],
  ): Promise<Array<{ driver_id: number; vehicle_id: number; plate_number: string; started_at: Date }>>;

  search(ctx: UserContext, filter: VehicleAssignmentFilter): Promise<VehicleAssignmentView[]>;

  // ✅ NEW: single boolean check used by the service
  isActivePair(association_id: number, driver_id: number, vehicle_id: number): Promise<boolean>;
}
