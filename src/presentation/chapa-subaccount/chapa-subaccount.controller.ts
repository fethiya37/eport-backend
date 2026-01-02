import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from '../../common/context/user-context';
import { AssociationSubaccountService } from '../../application/services/association-subaccount.service';
import { ChapaApiService } from '../../infrastructure/payments/chapa-api.service';
import { CreateSubaccountDto } from './dto/create-subaccount.dto';

@ApiTags('chapa-subaccounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AssociationContextGuard)
@Controller('chapa-subaccounts')
export class ChapaSubaccountController {
  constructor(
    private readonly svc: AssociationSubaccountService,
    private readonly chapa: ChapaApiService,
  ) {}

  @Get('banks')
  @Roles('Association')
  @ApiOperation({ summary: 'List banks from Chapa' })
  @ApiQuery({ name: 'country', required: false, example: 'ET' })
  async listBanks(@Query('country') country?: string) {
    return this.chapa.listBanks(country ?? 'ET');
  }

  @Post()
  @HttpCode(201)
  @Roles('Association')
  @ApiOperation({ summary: 'Create Chapa subaccount (one per association)' })
  @ApiResponse({ status: 201 })
  async create(@AuthUser() user: UserContext, @Body() dto: CreateSubaccountDto) {
    return this.svc.createForMyAssociation(user, {
      bank_code: dto.bank_code,
      account_number: dto.account_number,
      account_name: dto.account_name,
      business_name: dto.business_name,
      split_type: dto.split_type,
      split_value: dto.split_value,
    });
  }

  @Get('me')
  @Roles('Association')
  @ApiOperation({ summary: 'Get subaccount for my association' })
  async getMine(@AuthUser() user: UserContext) {
    return this.svc.getMine(user);
  }

  @Delete(':id')
  @HttpCode(200)
  @Roles('Association')
  @ApiOperation({ summary: 'Hard delete a subaccount record (DB only) for my association' })
  async remove(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.svc.hardDelete(user, id);
  }
}
