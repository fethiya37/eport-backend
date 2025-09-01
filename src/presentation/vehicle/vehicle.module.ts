import { Module } from '@nestjs/common';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from '../../application/services/vehicle.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import { PrismaVehicleRepository } from '../../infrastructure/repositories/prisma-vehicle.repository';
import { VEHICLE_ASSOC_REPOSITORY } from '../../domain/repositories/vehicle-association.repository';
import { PrismaVehicleAssociationRepository } from '../../infrastructure/repositories/prisma-vehicle-association.repository';

@Module({
  controllers: [VehicleController],
  providers: [
    VehicleService,
    PrismaService,
    { provide: VEHICLE_REPOSITORY, useClass: PrismaVehicleRepository },
    { provide: VEHICLE_ASSOC_REPOSITORY, useClass: PrismaVehicleAssociationRepository },
  ],
  exports: [VehicleService],
})
export class VehicleModule {}
