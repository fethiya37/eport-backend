import { Module } from '@nestjs/common';
import { RouteAssignmentController } from './route-assignment.controller';
import { RouteAssignmentService } from '../../application/services/route-assignment.service';
import { PrismaModule } from '../../../prisma/prisma.module';

import { ROUTE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/route-assignment.repository';
import { PrismaRouteAssignmentRepository } from '../../infrastructure/repositories/prisma-route-assignment.repository';
import { ActivityLogModule } from '../activity-log/activity-log.module';


@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [RouteAssignmentController],
  providers: [
    RouteAssignmentService,
    { provide: ROUTE_ASSIGNMENT_REPOSITORY, useClass: PrismaRouteAssignmentRepository },
  ],
  exports: [RouteAssignmentService],
})
export class RouteAssignmentModule {}
