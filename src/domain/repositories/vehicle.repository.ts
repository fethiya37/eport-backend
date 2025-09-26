import { Vehicle, VehicleStatus } from '@prisma/client';
import type { UserContext } from 'src/common/context/user-context';

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');

export type VehicleFilter = {
  id?: number;
  plate_number?: string;
  status?: VehicleStatus;
  owner_id?: number;
  driver_id?: number;          // ✅ filter by driver
  make?: string;
  model?: string;
  color?: string;
  association_id?: number;     // Admin/Superadmin can query
};

export interface IVehicleRepository {
  create(
    ctx: UserContext,
    data: {
      plate_number: string;
      libre_no?: string | null;
      owner_id: number;
      association_id: number;
      driver_id?: number | null;       // ✅ optional
      make?: string | null;
      model?: string | null;
      color?: string | null;
      capacity?: number | null;
      is_weekly: boolean;              // ✅ added
    }
  ): Promise<Vehicle>;

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
      driver_id: number | null;
      make: string | null;
      model: string | null;
      color: string | null;
      capacity: number | null;
      status: VehicleStatus;
      is_weekly: boolean;              // ✅ added
    }>
  ): Promise<Vehicle>;

  findAvailableForQuotaOrDirect(
    ctx: UserContext,
    input: { association_id?: number; is_weekly: boolean; start_date: Date; mode: 'quota' | 'direct' }
  ): Promise<{ count: number; vehicles?: Vehicle[] }>;

  remove(ctx: UserContext, id: number): Promise<Vehicle>;   // ✅ NEW

}
