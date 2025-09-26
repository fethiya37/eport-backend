import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { OwnerService } from '../../application/services/owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { UserContext } from 'src/common/context/user-context';

@ApiTags('owners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AssociationContextGuard)
@Controller('owners')
export class OwnerController {
  constructor(private readonly service: OwnerService) { }

  // READS
  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  @ApiQuery({ name: 'association_id', required: false, type: Number, description: 'Filter by association (Admin/Superadmin only)' })
  findAll(@AuthUser() user: UserContext, @Query('association_id') association_id?: number) {
    return this.service.findAll(user, association_id ? Number(association_id) : undefined);
  }

  @Get(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  findOne(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(user, id);
  }

  // MUTATIONS: Association only
  @Post()
  @Roles('Association')
  create(@AuthUser() user: UserContext, @Body() dto: CreateOwnerDto) {
    return this.service.create(user, dto);
  }

  @Patch(':id')
  @Roles('Association')
  update(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOwnerDto) {
    return this.service.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('Association')
  remove(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(user, id);
  }
}
