import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  constructor(private readonly service: OwnerService) {}

  // READS: allow Admin, Superadmin, Association
  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  findAll(@AuthUser() user: UserContext) {
    return this.service.findAll(user);
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
}
