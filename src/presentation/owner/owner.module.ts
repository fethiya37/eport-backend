import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { OwnerController } from './owner.controller';
import { OwnerService } from '../../application/services/owner.service';
import { OWNER_REPOSITORY } from '../../domain/repositories/owner.repository';
import { PrismaOwnerRepository } from '../../infrastructure/repositories/prisma-owner.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [OwnerController],
  providers: [
    OwnerService,
    { provide: OWNER_REPOSITORY, useClass: PrismaOwnerRepository },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [OwnerService],
})
export class OwnerModule {}
