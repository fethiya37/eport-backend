// src/presentation/vehicle/vehicle.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { VehicleController } from './vehicle.controller';
import { VehicleService } from '../../application/services/vehicle.service';

import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import { PrismaVehicleRepository } from '../../infrastructure/repositories/prisma-vehicle.repository';

import { VEHICLE_ASSOC_REPOSITORY } from '../../domain/repositories/vehicle-association.repository';
import { PrismaVehicleAssociationRepository } from '../../infrastructure/repositories/prisma-vehicle-association.repository';

import { VehicleAssignmentModule } from '../vehicle-assignment/vehicle-assignment.module';

// ⬇️ add this import (same path style you used in DriverModule)
import { AssociationPolicyModule } from 'src/presentation/association-policy/association-policy.module';

@Module({
  imports: [
    PrismaModule,
    VehicleAssignmentModule,    // provides VEHICLE_ASSIGNMENT_REPOSITORY
    AssociationPolicyModule,    // ⬅️ provides ASSOCIATION_POLICY_REPOSITORY
  ],
  controllers: [VehicleController],
  providers: [
    VehicleService,
    { provide: VEHICLE_REPOSITORY, useClass: PrismaVehicleRepository },
    { provide: VEHICLE_ASSOC_REPOSITORY, useClass: PrismaVehicleAssociationRepository },
  ],
  exports: [VehicleService],
})
export class VehicleModule {}
