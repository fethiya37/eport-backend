import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { DriverService } from '../../application/services/driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import type { UserContext } from 'src/common/context/user-context';
import type { DriverFilter } from 'src/domain/repositories/driver.repository';
import { DriverFilterDto } from './dto/driver-filter.dto';

@ApiTags('drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AssociationContextGuard)
@Controller('drivers')
export class DriverController {
  constructor(private readonly service: DriverService) { }

  // LIST: returns driver rows + active_plate_number
  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  findAll(@AuthUser() user: UserContext, @Query() filter: DriverFilterDto) {
    return this.service.findAll(user, filter);
  }

  @Get('without-vehicle')
  @Roles('Admin', 'Superadmin', 'Association')
  findWithoutVehicle(@AuthUser() user: UserContext) {
    return this.service.findDriversWithoutVehicle(user);
  }

  // DETAIL: returns single driver + active_plate_number
  @Get(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  findOne(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.findOneWithActive(user, id);
  }

  @Post()
  @Roles('Association')
  create(@AuthUser() user: UserContext, @Body() dto: CreateDriverDto) {
    return this.service.create(user, dto);
  }

  @Patch(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  update(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDriverDto) {
    return this.service.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  remove(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(user, id);
  }
}
