import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { VehicleAssignmentController } from './vehicle-assignment.controller';
import { VehicleAssignmentService } from '../../application/services/vehicle-assignment.service';

import { VEHICLE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/vehicle-assignment.repository';
import { PrismaVehicleAssignmentRepository } from '../../infrastructure/repositories/prisma-vehicle-assignment.repository';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleAssignmentController],
  providers: [
    VehicleAssignmentService,
    { provide: VEHICLE_ASSIGNMENT_REPOSITORY, useClass: PrismaVehicleAssignmentRepository },
  ],
  exports: [
    VehicleAssignmentService,
    VEHICLE_ASSIGNMENT_REPOSITORY, 
  ],
})
export class VehicleAssignmentModule {}
