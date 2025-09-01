import { Module } from '@nestjs/common';
import { RouteAssignmentController } from './route-assignment.controller';
import { RouteAssignmentService } from '../../application/services/route-assignment.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ROUTE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/route-assignment.repository';
import { PrismaRouteAssignmentRepository } from '../../infrastructure/repositories/prisma-route-assignment.repository';

@Module({
  controllers: [RouteAssignmentController],
  providers: [
    RouteAssignmentService,
    PrismaService,
    { provide: ROUTE_ASSIGNMENT_REPOSITORY, useClass: PrismaRouteAssignmentRepository },
  ],
  exports: [RouteAssignmentService],
})
export class RouteAssignmentModule {}
