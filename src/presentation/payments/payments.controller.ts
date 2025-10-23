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
  constructor(private readonly service: PaymentsService) {}

  @Post('apply')
  @Roles('Association', 'Driver')
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

  // Not Public: uses PayDto + auth context (Association/Driver)
  @Post('online/init')
  @Roles('Association', 'Driver')
  onlineInit(@AuthUser() user: UserContext, @Body() dto: PayDto) {
    return this.service.initOnlineFromPayDto(user, dto);
  }

  // UX-only return page (public)
  @Get('online/return')
  @Public()
  @HttpCode(200)
  onlineReturn() {
    return `
      <div style="font-family:sans-serif;max-width:560px;margin:40px auto;text-align:center">
        <h2>Thanks! If your payment succeeded, we’ll confirm shortly.</h2>
        <p>You can close this tab now.</p>
      </div>
    `;
  }

  // Public callback: verify then record
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
