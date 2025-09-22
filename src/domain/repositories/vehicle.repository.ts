import { Vehicle, VehicleStatus } from '@prisma/client';
import type { UserContext } from 'src/common/context/user-context';

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');

export type VehicleFilter = {
  id?: number;
  plate_number?: string;
  status?: VehicleStatus;
  owner_id?: number;
  make?: string;
  model?: string;
  color?: string;
};

export interface IVehicleRepository {
  create(ctx: UserContext, data: {
    plate_number: string;
    libre_no?: string | null;
    owner_id: number;
    association_id: number;   // enforced from ctx
    make?: string | null;
    model?: string | null;
    color?: string | null;
    capacity?: number | null;
  }): Promise<Vehicle>;

  findAll(ctx: UserContext, filter?: VehicleFilter): Promise<Vehicle[]>;
  findById(ctx: UserContext, id: number): Promise<Vehicle | null>;
  findActiveWithoutDriver(ctx: UserContext): Promise<Vehicle[]>;


  update(
    ctx: UserContext,
    id: number,
    data: Partial<{
      plate_number: string | null;
      libre_no: string | null;
      owner_id: number;
      make: string | null;
      model: string | null;
      color: string | null;
      capacity: number | null;
      status: VehicleStatus;
    }>
  ): Promise<Vehicle>;
}
