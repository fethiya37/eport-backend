import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './presentation/auth/auth.module';
import { UserModule } from './presentation/user/user.module';
import { AssociationModule } from './presentation/association/association.module';
import { OwnerModule } from './presentation/owner/owner.module';
import { VehicleModule } from './presentation/vehicle/vehicle.module';
import { DriverModule } from './presentation/driver/driver.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './infrastructure/auth/jwt.guard';
import { RolesGuard } from './infrastructure/auth/roles.guard';
import { RouteAssignmentModule } from './presentation/route-assignment/route-assignment.module';
import { RoutesModule } from './presentation/routes/routes.module';
import { RouteQuotaModule } from './presentation/route-quota/route-quota.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    AssociationModule,
    OwnerModule,
    VehicleModule,
    DriverModule,
    RouteAssignmentModule,
    RoutesModule,
    RouteQuotaModule
  ],
  controllers: [AppController],
  providers: [AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // every route needs a valid JWT
    { provide: APP_GUARD, useClass: RolesGuard },   // @Roles() works anywhere
 ],
})
export class AppModule { }
