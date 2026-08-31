import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from '../../common/context/user-context';
import { SmsGatewayService } from '../../application/services/sms-gateway.service';
import { SendSmsDto } from './dto/send-sms.dto';

@ApiTags('sms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsGatewayService) {}

  @Post('send')
  @Roles('Admin', 'Superadmin', 'Association')
  async sendSms(@AuthUser() user: UserContext, @Body() dto: SendSmsDto) {
    const result = await this.smsService.sendSms(dto.to, dto.message);
    return {
      success: true,
      message: 'SMS sent successfully',
      data: result,
    };
  }
}
