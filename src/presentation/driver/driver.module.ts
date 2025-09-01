import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from '../../application/services/driver.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { DRIVER_REPOSITORY } from '../../domain/repositories/driver.repository';
import { PrismaDriverRepository } from '../../infrastructure/repositories/prisma-driver.repository';

import { VEHICLE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/vehicle-assignment.repository';
import { PrismaVehicleAssignmentRepository } from 'src/infrastructure/repositories/prisma-vehicle-assignment.repository';

@Module({
  controllers: [DriverController],
  providers: [
    DriverService,
    PrismaService,
    { provide: DRIVER_REPOSITORY, useClass: PrismaDriverRepository },
    { provide: VEHICLE_ASSIGNMENT_REPOSITORY, useClass: PrismaVehicleAssignmentRepository},
  ],
  exports: [DriverService],
})
export class DriverModule {}
