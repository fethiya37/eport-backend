import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VEHICLE_ASSOC_REPOSITORY, IVehicleAssociationRepository } from '../../domain/repositories/vehicle-association.repository';
import { VehicleAssociation, VehicleAssociationStatus } from '@prisma/client';

@Injectable()
export class PrismaVehicleAssociationRepository implements IVehicleAssociationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    association_id: number;
    vehicle_id: number;
    status: VehicleAssociationStatus;
    started_at?: Date;
  }): Promise<VehicleAssociation> {
    return this.prisma.vehicleAssociation.create({
      data: {
        association_id: data.association_id,
        vehicle_id: data.vehicle_id,
        status: data.status,
        started_at: data.started_at ?? new Date(),
        ended_at: null,
      },
    });
  }

  async closeActiveForVehicle(vehicle_id: number, finalStatus: VehicleAssociationStatus, endedAt?: Date): Promise<void> {
    // Close the most recent active row (status ACTIVE and ended_at null)
    await this.prisma.vehicleAssociation.updateMany({
      where: { vehicle_id, status: 'ACTIVE', ended_at: null },
      data: { ended_at: endedAt ?? new Date(), status: finalStatus },
    });
  }

  async findCurrentActive(vehicle_id: number): Promise<VehicleAssociation | null> {
    return this.prisma.vehicleAssociation.findFirst({
      where: { vehicle_id, status: 'ACTIVE', ended_at: null },
      orderBy: { started_at: 'desc' },
    });
  }

  async findAllByVehicle(vehicle_id: number): Promise<VehicleAssociation[]> {
    return this.prisma.vehicleAssociation.findMany({
      where: { vehicle_id },
      orderBy: { started_at: 'desc' },
    });
  }
}
