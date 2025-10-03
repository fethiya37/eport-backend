// src/presentation/payments/payments.controller.ts
import { Body, Controller, Post, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';
import { PayDto } from './dto/pay.dto';
import { PaymentsService } from 'src/application/services/payments.service';
import { ListPaymentsDto } from './dto/list-payments.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) { }

  @Post('apply')
  @Roles('Admin', 'Superadmin', 'Association', 'Driver', 'Controller')
  apply(@AuthUser() user: UserContext, @Body() dto: PayDto) {
    return this.service.applyPayment(user, dto);
  }


  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  list(@AuthUser() user: UserContext, @Query() filters: ListPaymentsDto) {
    return this.service.listPayments(user, filters);
  }

}
