import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from '../../application/services/vehicle.service';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import { PrismaVehicleRepository } from '../../infrastructure/repositories/prisma-vehicle.repository';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleController],
  providers: [
    VehicleService,
    { provide: VEHICLE_REPOSITORY, useClass: PrismaVehicleRepository },
  ],
  exports: [VehicleService],
})
export class VehicleModule {}
