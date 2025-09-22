import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoutesService } from '../../application/services/routes.service';
import { UpsertGroupWithRoutesDto } from './dto/upsert-group-with-routes.dto';
import { RouteFilterDto } from './dto/route-filter.dto';
import { RouteInputDto } from './dto/route-input.dto';

import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';

@ApiTags('routes')
@Controller('routes')
@UseGuards(JwtAuthGuard) // GETs require auth for any role
export class RoutesController {
  constructor(private readonly service: RoutesService) { }

  // ---------- READ ----------
  @Get('groups')
  listGroups(
    @Query('includeRoutes', new ParseBoolPipe({ optional: true })) includeRoutes?: boolean,
  ) {
    return this.service.listRouteGroups(Boolean(includeRoutes));
  }

  @Get()
  listRoutes(@Query() filter: RouteFilterDto) {
    return this.service.listRoutes(filter);
  }

  @Get(':id')
  getRoute(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRoute(id);
  }

  @Get('groups/:id')
  getGroup(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRouteGroup(id, true);
  }

  // ---------- WRITE (Admin/Superadmin only) ----------
  @Post('upsert-group-with-routes')
  @ApiBearerAuth()
  @Roles('Admin', 'Superadmin')
  upsertGroupWithRoutes(@AuthUser() user: UserContext, @Body() dto: UpsertGroupWithRoutesDto) {
    return this.service.upsertGroupWithRoutes(user, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('Admin', 'Superadmin')
  updateSingleRoute(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number, @Body() body: RouteInputDto) {
    return this.service.updateSingleRoute(user, id, body);
  }

  @Delete('groups/:id')
  @ApiBearerAuth()
  @Roles('Admin', 'Superadmin')
  deleteGroup(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.deleteGroup(user, id);
  }
}
