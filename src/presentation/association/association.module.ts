import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AssociationController } from './association.controller';
import { AssociationService } from '../../application/services/association.service';
import { ASSOCIATION_REPOSITORY } from '../../domain/repositories/association.repository';
import { PrismaAssociationRepository } from '../../infrastructure/repositories/prisma-association.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AssociationController],
  providers: [
    AssociationService,
    { provide: ASSOCIATION_REPOSITORY, useClass: PrismaAssociationRepository },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository }, // <-- add this
  ],
  exports: [AssociationService],
})
export class AssociationModule {}
