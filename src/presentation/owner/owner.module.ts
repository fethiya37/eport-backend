import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { OwnerController } from './owner.controller';
import { OwnerService } from '../../application/services/owner.service';
import { OWNER_REPOSITORY } from '../../domain/repositories/owner.repository';
import { PrismaOwnerRepository } from '../../infrastructure/repositories/prisma-owner.repository';

@Module({
  imports: [PrismaModule],
  controllers: [OwnerController],
  providers: [
    OwnerService,
    { provide: OWNER_REPOSITORY, useClass: PrismaOwnerRepository },
  ],
  exports: [OwnerService],
})
export class OwnerModule {}
