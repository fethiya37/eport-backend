import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './presentation/auth/auth.module';
import { UserModule } from './presentation/user/user.module';
import { AssociationModule } from './presentation/association/association.module';
import { OwnerModule } from './presentation/owner/owner.module';
import { VehicleModule } from './presentation/vehicle/vehicle.module';
import { DriverModule } from './presentation/driver/driver.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    AssociationModule,
    OwnerModule,
    VehicleModule,
    DriverModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
