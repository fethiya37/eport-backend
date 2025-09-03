// src/presentation/route-assignment/route-assignment.module.ts
import { Module } from '@nestjs/common';
import { RouteAssignmentController } from './route-assignment.controller';
import { RouteAssignmentService } from '../../application/services/route-assignment.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { ROUTE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/route-assignment.repository';
import { PrismaRouteAssignmentRepository } from '../../infrastructure/repositories/prisma-route-assignment.repository';

import { VEHICLE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/vehicle-assignment.repository';
import { PrismaVehicleAssignmentRepository } from '../../infrastructure/repositories/prisma-vehicle-assignment.repository';

@Module({
  imports: [PrismaModule],
  controllers: [RouteAssignmentController],
  providers: [
    RouteAssignmentService,
    { provide: ROUTE_ASSIGNMENT_REPOSITORY, useClass: PrismaRouteAssignmentRepository },
    { provide: VEHICLE_ASSIGNMENT_REPOSITORY, useClass: PrismaVehicleAssignmentRepository },
  ],
  exports: [RouteAssignmentService],
})
export class RouteAssignmentModule {}
