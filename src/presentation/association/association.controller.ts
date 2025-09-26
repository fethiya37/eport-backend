import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Delete,
} from '@nestjs/common';
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

  @Public()
  @Get()
  publicList(@Query() filter: AssociationFilterDto) {
    return this.service.publicList(filter);
  }

  @Public()
  @Get(':id')
  publicGet(@Param('id', ParseIntPipe) id: number) {
    return this.service.publicGet(id);
  }

  @ApiBearerAuth()
  @Post()
  @Roles('Admin', 'Superadmin')
  create(@AuthUser() user: UserContext, @Body() dto: CreateAssociationDto) {
    return this.service.create(user, dto);
  }

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

  @ApiBearerAuth()
  @Delete(':id')
  @Roles('Admin', 'Superadmin')
  delete(
    @AuthUser() user: UserContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.delete(user, id);
  }
}
