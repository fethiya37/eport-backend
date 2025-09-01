import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RouteQuotaService } from '../../application/services/route-quota.service';
import { CreateRouteQuotaDto } from './dto/create-route-quota.dto';
import { UpdateRouteQuotaDto } from './dto/update-route-quota.dto';
import { RouteQuotaFilterDto } from './dto/route-quota-filter.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';

@ApiTags('route-quotas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('route-quotas')
export class RouteQuotaController {
  constructor(private readonly service: RouteQuotaService) {}

  @Post()
  @Roles('Admin', 'Superadmin')
  create(@AuthUser() user: UserContext, @Body() dto: CreateRouteQuotaDto) {
    return this.service.create(user, dto);
  }

  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  find(@AuthUser() user: UserContext, @Query() filter: RouteQuotaFilterDto) {
    return this.service.find(user, filter);
  }

  @Patch(':id')
  @Roles('Admin', 'Superadmin')
  update(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRouteQuotaDto) {
    return this.service.update(user, id, dto);
  }
}
