import { Module } from '@nestjs/common';
import { BillingJobs } from './billing.jobs';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ROUTE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/route-assignment.repository';
import { PrismaRouteAssignmentRepository } from '../../infrastructure/repositories/prisma-route-assignment.repository';

@Module({
  providers: [
    BillingJobs,
    PrismaService,
    { provide: ROUTE_ASSIGNMENT_REPOSITORY, useClass: PrismaRouteAssignmentRepository },
  ],
})
export class JobsModule {}
