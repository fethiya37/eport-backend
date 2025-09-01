import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { DriverService } from '../../application/services/driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import type { UserContext } from 'src/common/context/user-context';
import type { DriverFilter } from 'src/domain/repositories/driver.repository';

@ApiTags('drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AssociationContextGuard)
@Controller('drivers')
export class DriverController {
  constructor(private readonly service: DriverService) { }

  // READS: Admin, Superadmin, Association
  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  findAll(@AuthUser() user: UserContext, @Query() filter: DriverFilter) {
    return this.service.findAll(user, filter);
  }

  @Get(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  findOne(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    // returns driver plus active_vehicle_id for edit form
    return this.service.findOneWithActive(user, id);
  }

  // MUTATIONS: Association only
  @Post()
  @Roles('Association')
  create(@AuthUser() user: UserContext, @Body() dto: CreateDriverDto) {
    return this.service.create(user, dto);
  }

  @Patch(':id')
  @Roles('Association')
  update(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDriverDto) {
    return this.service.update(user, id, dto);
  }

  @Get('active-pairs')
  @Roles('Admin', 'Superadmin', 'Association')
  activePairs(
    @AuthUser() user: UserContext,
    @Query('association_id') associationIdRaw?: string,   // optional for Admin/Superadmin
  ) {
    const association_id = associationIdRaw ? Number(associationIdRaw) : undefined;
    return this.service.listActiveDriverVehiclePairs(user, association_id);
  }
}
