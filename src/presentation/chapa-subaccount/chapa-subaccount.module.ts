import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { ChapaSubaccountController } from './chapa-subaccount.controller';
import { AssociationSubaccountService } from '../../application/services/association-subaccount.service';
import { ChapaApiService } from '../../infrastructure/payments/chapa-api.service';
import { ASSOCIATION_SUBACCOUNT_REPOSITORY } from '../../domain/repositories/association-subaccount.repository';
import { PrismaAssociationSubaccountRepository } from '../../infrastructure/repositories/prisma-association-subaccount.repository';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [ChapaSubaccountController],
  providers: [
    AssociationSubaccountService,
    ChapaApiService,
    { provide: ASSOCIATION_SUBACCOUNT_REPOSITORY, useClass: PrismaAssociationSubaccountRepository },
  ],
  exports: [AssociationSubaccountService],
})
export class ChapaSubaccountModule {}
