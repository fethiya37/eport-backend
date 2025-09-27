import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';
import { PayDto } from './dto/pay.dto';
import { PaymentsService } from 'src/application/services/payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  /**
   * One endpoint for both Drivers and Association users.
   * - Drivers can pay for themselves or others within their association.
   * - Association users can pay for any driver in their association.
   * - Admin/Superadmin can pay for any association.
   */
  @Post('apply')
  @Roles('Admin', 'Superadmin', 'Association', 'Driver', 'Controller')
  apply(@AuthUser() user: UserContext, @Body() dto: PayDto) {
    return this.service.applyPayment(user, dto);
  }
}
