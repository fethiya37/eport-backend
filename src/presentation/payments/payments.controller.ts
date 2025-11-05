import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';
import { PayDto } from './dto/pay.dto';
import { PaymentsService } from 'src/application/services/payments.service';
import { ListPaymentsDto } from './dto/list-payments.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) { }

  @Post('apply')
  @Roles('Association')
  apply(@AuthUser() user: UserContext, @Body() dto: PayDto) {
    return this.service.applyPayment(user, dto);
  }

  @Get()
  @Roles('Association')
  list(@AuthUser() user: UserContext, @Query() filters: ListPaymentsDto) {
    return this.service.listPayments(user, filters);
  }

  @Get('total')
  @Roles('Association')
  total(@AuthUser() user: UserContext) {
    return this.service.totalPayments(user);
  }

  @Post('online/init')
  @Roles('Driver')
  onlineInit(@AuthUser() user: UserContext, @Body() dto: PayDto) {
    return this.service.initOnlineFromPayDto(user, dto);
  }

  @Get('online/return')
  @Public()
  @HttpCode(200)
  onlineReturn() {
    return `
    <div style="
      font-family: 'Segoe UI', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f1f5f9;
    ">
      <div style="
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        padding: 32px 40px;
        text-align: center;
        max-width: 420px;
      ">
        <div style="
          font-size: 52px;
          color: #16a34a;
          margin-bottom: 12px;
        ">
          ✓
        </div>
        <h2 style="
          color: #16a34a;
          font-size: 24px;
          margin-bottom: 8px;
        ">
          Payment Successful
        </h2>
        <p style="
          color: #475569;
          font-size: 16px;
          line-height: 1.5;
          margin-top: 0;
        ">
          Your payment has been processed successfully.<br/>
          You can safely close this page now.
        </p>
      </div>
    </div>
  `;
  }


  @Get('callback')
  @Public()
  async callback(@Query('trx_ref') txRef: string) {
    if (!txRef) throw new BadRequestException('Missing trx_ref');
    try {
      return await this.service.recordAfterChapaSuccess(txRef);
    } catch (e: any) {
      return {
        recorded: false,
        status: 'error',
        message: e?.message ?? 'Unknown error',
      };
    }
  }
}
