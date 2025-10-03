import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
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
import { AssociationPolicyModule } from './presentation/association-policy/association-policy.module';
import { PaymentsModule } from './presentation/payments/payments.module';
import { JobsModule } from './application/jobs/jobs.module';
import { SmsModule } from './presentation/sms/sms.module';
import { HealthController } from './health.controller';

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
    RouteQuotaModule,
    ScheduleModule.forRoot(),
    AssociationPolicyModule,
    PaymentsModule,
    JobsModule,
    SmsModule
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // every route needs a valid JWT
    { provide: APP_GUARD, useClass: RolesGuard },   // @Roles() works anywhere
  ],
})
export class AppModule { }
