import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { DriverController } from './driver.controller';
import { DriverService } from '../../application/services/driver.service';
import { DRIVER_REPOSITORY } from '../../domain/repositories/driver.repository';
import { PrismaDriverRepository } from '../../infrastructure/repositories/prisma-driver.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [DriverController],
  providers: [
    DriverService,
    { provide: DRIVER_REPOSITORY, useClass: PrismaDriverRepository },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [DriverService],
})
export class DriverModule {}
