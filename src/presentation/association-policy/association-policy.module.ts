import { Module } from '@nestjs/common';
import { AssociationPolicyController } from './association-policy.controller';
import { AssociationPolicyService } from '../../application/services/association-policy.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { ASSOCIATION_POLICY_REPOSITORY } from '../../domain/repositories/association-policy.repository';
import { PrismaAssociationPolicyRepository } from '../../infrastructure/repositories/prisma-association-policy.repository';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [AssociationPolicyController],
  providers: [
    AssociationPolicyService,
    { provide: ASSOCIATION_POLICY_REPOSITORY, useClass: PrismaAssociationPolicyRepository },
  ],
  exports: [AssociationPolicyService, ASSOCIATION_POLICY_REPOSITORY],
})
export class AssociationPolicyModule {}
