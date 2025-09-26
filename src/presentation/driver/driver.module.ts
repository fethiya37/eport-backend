// src/presentation/driver/driver.module.ts
import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from '../../application/services/driver.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { DRIVER_REPOSITORY } from '../../domain/repositories/driver.repository';
import { PrismaDriverRepository } from '../../infrastructure/repositories/prisma-driver.repository';
import { AssociationPolicyModule } from 'src/presentation/association-policy/association-policy.module';

@Module({
  imports: [
    PrismaModule,
    AssociationPolicyModule, 
  ],
  controllers: [DriverController],
  providers: [
    DriverService,
    { provide: DRIVER_REPOSITORY, useClass: PrismaDriverRepository },
  ],
  exports: [DriverService],
})
export class DriverModule {}
