import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SmsGatewayService } from 'src/application/services/sms-gateway.service';
import { RouteAssignmentModule } from '../route-assignment/route-assignment.module';

@Module({
  imports: [
    HttpModule,
    RouteAssignmentModule,
  ],
  providers: [SmsGatewayService],
  exports: [SmsGatewayService],
})
export class SmsModule { }
