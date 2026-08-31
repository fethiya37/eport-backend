import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SmsGatewayService } from '../../application/services/sms-gateway.service';
import { SmsController } from '../../presentation/sms/sms.controller';

@Module({
  imports: [HttpModule],
  controllers: [SmsController],
  providers: [SmsGatewayService],
  exports: [SmsGatewayService],
})
export class SmsModule {}
