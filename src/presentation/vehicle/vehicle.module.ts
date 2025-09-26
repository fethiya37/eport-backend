// src/presentation/vehicle/vehicle.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { VehicleController } from './vehicle.controller';
import { VehicleService } from '../../application/services/vehicle.service';

import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import { PrismaVehicleRepository } from '../../infrastructure/repositories/prisma-vehicle.repository';



// ⬇️ add this import (same path style you used in DriverModule)
import { AssociationPolicyModule } from 'src/presentation/association-policy/association-policy.module';

@Module({
  imports: [
    PrismaModule,
    AssociationPolicyModule,    // ⬅️ provides ASSOCIATION_POLICY_REPOSITORY
  ],
  controllers: [VehicleController],
  providers: [
    VehicleService,
    { provide: VEHICLE_REPOSITORY, useClass: PrismaVehicleRepository }],
  exports: [VehicleService],
})
export class VehicleModule {}
