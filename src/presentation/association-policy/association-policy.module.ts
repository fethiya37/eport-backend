// src/presentation/association-policy/association-policy.module.ts
import { Module } from '@nestjs/common';
import { AssociationPolicyController } from './association-policy.controller';
import { AssociationPolicyService } from '../../application/services/association-policy.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ASSOCIATION_POLICY_REPOSITORY } from '../../domain/repositories/association-policy.repository';
import { PrismaAssociationPolicyRepository } from '../../infrastructure/repositories/prisma-association-policy.repository';

@Module({
  controllers: [AssociationPolicyController],
  providers: [
    AssociationPolicyService,
    PrismaService,
    { provide: ASSOCIATION_POLICY_REPOSITORY, useClass: PrismaAssociationPolicyRepository },
  ],
  exports: [AssociationPolicyService],
})
export class AssociationPolicyModule {}
