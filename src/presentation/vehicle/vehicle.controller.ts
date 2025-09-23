import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
  @Roles('Association')
  update(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) {
    return this.service.update(user, id, dto);
  }

  @Get('available')
  @Roles('Admin', 'Superadmin', 'Association')
  findActiveWithoutDriver(@AuthUser() user: UserContext) {
    return this.service.findActiveWithoutDriver(user);
  }
}
