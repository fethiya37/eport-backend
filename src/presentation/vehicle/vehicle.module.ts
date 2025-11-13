import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from '../../application/services/vehicle.service';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import { PrismaVehicleRepository } from '../../infrastructure/repositories/prisma-vehicle.repository';
import { AssociationPolicyModule } from 'src/presentation/association-policy/association-policy.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    PrismaModule,
    AssociationPolicyModule, 
    ActivityLogModule,
  ],
  controllers: [VehicleController],
  providers: [
    VehicleService,
    { provide: VEHICLE_REPOSITORY, useClass: PrismaVehicleRepository }],
  exports: [VehicleService],
})
export class VehicleModule {}
