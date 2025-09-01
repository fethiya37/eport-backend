import { VehicleAssociation, VehicleAssociationStatus } from '@prisma/client';

export const VEHICLE_ASSOC_REPOSITORY = Symbol('VEHICLE_ASSOC_REPOSITORY');

export interface IVehicleAssociationRepository {
  create(data: {
    association_id: number;
    vehicle_id: number;
    status: VehicleAssociationStatus;  // ACTIVE | SUSPENDED | RESIGNED
    started_at?: Date;                 // default now
  }): Promise<VehicleAssociation>;

  closeActiveForVehicle(vehicle_id: number, finalStatus: VehicleAssociationStatus, endedAt?: Date): Promise<void>;

  findCurrentActive(vehicle_id: number): Promise<VehicleAssociation | null>;
  findAllByVehicle(vehicle_id: number): Promise<VehicleAssociation[]>;

}
