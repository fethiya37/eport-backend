import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { SmsGatewayService } from '../../application/services/sms-gateway.service';
import { Public } from '../../common/decorators/public.decorator'; // <-- import

@Controller('sms')
export class SmsController {
  constructor(private readonly smsGateway: SmsGatewayService) {}

  @Post('test')
  @Public() // <-- add this line
  async sendTestSms(@Body('to') to: string, @Body('message') message: string) {
    if (!to || !message) {
      throw new BadRequestException('Both "to" and "message" are required');
    }
    const result = await this.smsGateway.sendSms(to, message);
    return { success: true, result };
  }
}
