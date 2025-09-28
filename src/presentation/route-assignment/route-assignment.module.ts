// src/presentation/route-assignment/route-assignment.module.ts
import { Module } from '@nestjs/common';
import { RouteAssignmentController } from './route-assignment.controller';
import { RouteAssignmentService } from '../../application/services/route-assignment.service';
import { PrismaModule } from '../../../prisma/prisma.module';

import { ROUTE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/route-assignment.repository';
import { PrismaRouteAssignmentRepository } from '../../infrastructure/repositories/prisma-route-assignment.repository';


@Module({
  imports: [PrismaModule],
  controllers: [RouteAssignmentController],
  providers: [
    RouteAssignmentService,
    { provide: ROUTE_ASSIGNMENT_REPOSITORY, useClass: PrismaRouteAssignmentRepository },
  ],
  exports: [RouteAssignmentService],
})
export class RouteAssignmentModule {}
