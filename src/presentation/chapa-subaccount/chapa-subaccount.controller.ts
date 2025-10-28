import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @Roles('Admin', 'Superadmin', 'Association')
  @ApiOperation({ summary: 'List banks from Chapa' })
  @ApiQuery({ name: 'country', required: false, example: 'ET' })
  async listBanks(@Query('country') country?: string) {
    return this.chapa.listBanks(country ?? 'ET');
  }

  @Post()
  @HttpCode(201)
  @Roles('Association', 'Admin', 'Superadmin')
  @ApiOperation({ summary: 'Create Chapa subaccount (one per association)' })
  @ApiResponse({ status: 201 })
  @ApiQuery({
    name: 'association_id',
    required: false,
    type: Number,
    description: 'Admin/Superadmin must pass this; Association users use their own',
  })
  async create(
    @AuthUser() user: UserContext,
    @Body() dto: CreateSubaccountDto,
    @Query('association_id') association_id?: number,
  ) {
    return this.svc.createForAssociation(
      user,
      {
        bank_code: dto.bank_code,
        account_number: dto.account_number,
        account_name: dto.account_name,
        business_name: dto.business_name,
        split_type: dto.split_type,
        split_value: dto.split_value,
      },
      association_id ? Number(association_id) : undefined,
    );
  }

  @Get('me')
  @Roles('Association', 'Admin', 'Superadmin')
  @ApiOperation({ summary: 'Get subaccount for your association or a given association_id' })
  @ApiQuery({
    name: 'association_id',
    required: false,
    type: Number,
    description: 'Admin/Superadmin can query any association; Association users get their own',
  })
  async getMine(@AuthUser() user: UserContext, @Query('association_id') association_id?: number) {
    return this.svc.getMine(user, association_id ? Number(association_id) : undefined);
  }

  @Delete(':id')
  @HttpCode(200)
  @Roles('Association', 'Admin', 'Superadmin')
  @ApiOperation({ summary: 'Hard delete a subaccount record (DB only)' })
  async remove(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.svc.hardDelete(user, id);
  }
}
