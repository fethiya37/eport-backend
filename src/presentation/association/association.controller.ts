import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { AssociationService } from '../../application/services/association.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { AssociationFilterDto } from './dto/association-filter.dto';

import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { UserContext } from 'src/common/context/user-context';

@ApiTags('associations')
@Controller('associations')
export class AssociationController {
  constructor(private readonly service: AssociationService) {}

  // PUBLIC list (needed before login)
  @Public()
  @Get()
  publicList(@Query() filter: AssociationFilterDto) {
    return this.service.publicList(filter);
  }

  // PUBLIC get by id (needed before login)
  @Public()
  @Get(':id')
  publicGet(@Param('id', ParseIntPipe) id: number) {
    return this.service.publicGet(id);
  }

  // Admin/Superadmin only
  @ApiBearerAuth()
  @Post()
  @Roles('Admin', 'Superadmin')
  create(@AuthUser() user: UserContext, @Body() dto: CreateAssociationDto) {
    return this.service.create(user, dto);
  }

  // Admin/Superadmin only
  @ApiBearerAuth()
  @Patch(':id')
  @Roles('Admin', 'Superadmin')
  update(
    @AuthUser() user: UserContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssociationDto,
  ) {
    return this.service.update(user, id, dto);
  }

}
