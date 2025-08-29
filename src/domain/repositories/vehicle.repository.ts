import { Vehicle } from '../entities/vehicle.entity';

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');

export interface IVehicleRepository {
  create(data: {
    plate_number: string;
    libre_no?: string | null;
    owner_id: number;
    association_id: number;
    make?: string | null;
    model?: string | null;
    color?: string | null;
    capacity?: number | null;
    status?: Vehicle['status'];
    started_at?: Date;            // optional override
  }): Promise<Vehicle>;

  findById(id: number): Promise<Vehicle | null>;
  findByPlate(plate_number: string): Promise<Vehicle | null>;

  list(params: {
    association_id: number;
    skip?: number;
    take?: number;
    status?: Vehicle['status'];
    search?: string; // plate/libre/make/model/color
    include_deleted?: boolean;
  }): Promise<Vehicle[]>;

  update(id: number, data: {
    plate_number?: string;
    libre_no?: string | null;
    owner_id?: number;
    make?: string | null;
    model?: string | null;
    color?: string | null;
    capacity?: number | null;
    status?: Vehicle['status'];
    started_at?: Date | null;
    ended_at?: Date | null;
  }): Promise<Vehicle>;

  softDelete(id: number): Promise<void>;
}
