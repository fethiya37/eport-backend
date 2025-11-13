import { Module } from '@nestjs/common';
import { AssociationController } from './association.controller';
import { AssociationService } from '../../application/services/association.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ASSOCIATION_REPOSITORY } from '../../domain/repositories/association.repository';
import { PrismaAssociationRepository } from '../../infrastructure/repositories/prisma-association.repository';
import { PrismaModule } from 'prisma/prisma.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [AssociationController],
  providers: [
    AssociationService,
    PrismaService,
    { provide: ASSOCIATION_REPOSITORY, useClass: PrismaAssociationRepository },
  ],
  exports: [AssociationService],
})
export class AssociationModule { }
