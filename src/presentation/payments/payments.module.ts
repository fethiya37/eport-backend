import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { DRIVER_REPOSITORY } from '../../domain/repositories/driver.repository';
import { PrismaDriverRepository } from '../../infrastructure/repositories/prisma-driver.repository';

import { DRIVER_PAYMENT_REPOSITORY } from '../../domain/repositories/driver-payment.repository';
import { PrismaDriverPaymentRepository } from '../../infrastructure/repositories/prisma-driver-payment.repository';

import { VEHICLE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/vehicle-assignment.repository';
import { PrismaVehicleAssignmentRepository } from '../../infrastructure/repositories/prisma-vehicle-assignment.repository';

import { ASSOCIATION_POLICY_REPOSITORY } from '../../domain/repositories/association-policy.repository';
import { PrismaAssociationPolicyRepository } from '../../infrastructure/repositories/prisma-association-policy.repository';
import { PaymentsService } from 'src/application/services/payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PrismaService,
    { provide: DRIVER_REPOSITORY, useClass: PrismaDriverRepository },
    { provide: DRIVER_PAYMENT_REPOSITORY, useClass: PrismaDriverPaymentRepository },
    { provide: VEHICLE_ASSIGNMENT_REPOSITORY, useClass: PrismaVehicleAssignmentRepository },
    { provide: ASSOCIATION_POLICY_REPOSITORY, useClass: PrismaAssociationPolicyRepository },
  ],
})
export class PaymentsModule {}
