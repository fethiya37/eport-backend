import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { VehicleService } from '../../application/services/vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFilterDto } from './dto/vehicle-filter.dto';
import type { UserContext } from 'src/common/context/user-context';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AssociationContextGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly service: VehicleService) { }

  // READS
  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  findAll(@AuthUser() user: UserContext, @Query() filter: VehicleFilterDto) {
    return this.service.findAll(user, filter);
  }

  @Get('resolve')
  @Roles('Driver', 'Association')
  resolveForPayment(
    @AuthUser() user: UserContext,
    @Query('plate') plate?: string,
    @Query('driver_id') driver_id?: string,
  ) {
    return this.service.resolveForPayment(user, {
      plate,
      driver_id: driver_id ? Number(driver_id) : undefined,
    });
  }



  @Get(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  findOne(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(user, id);
  }

  // MUTATIONS: Association only
  @Post()
  @Roles('Association')
  create(@AuthUser() user: UserContext, @Body() dto: CreateVehicleDto) {
    return this.service.create(user, dto);
  }


  @Patch(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  update(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) {
    return this.service.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  remove(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(user, id);
  }






  @Get('available/for-quota-or-direct')
  @Roles('Admin', 'Superadmin', 'Association')
  findAvailableForQuotaOrDirect(
    @AuthUser() user: UserContext,
    @Query('is_weekly', ParseBoolPipe) is_weekly: boolean,
    @Query('start_date') start_date: string,
    @Query('mode') mode: 'quota' | 'direct',
    @Query('association_id', ParseIntPipe) association_id?: number,
  ) {
    return this.service.findAvailableForQuotaOrDirect(user, {
      association_id,
      is_weekly,
      start_date: new Date(start_date),
      mode,
    });
  }
}
