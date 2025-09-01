import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { UserContext } from 'src/common/context/user-context';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  @Roles('Admin', 'Superadmin')
  create(@AuthUser() user: UserContext, @Body() dto: CreateUserDto) {
    return this.service.create(user, dto);
  }

  @Get()
  @Roles('Admin', 'Superadmin')
  findAll(@AuthUser() user: UserContext, @Query() filter: UserFilterDto) {
    const normalized = {
      ...filter,
      is_locked: filter.is_locked === undefined ? undefined : filter.is_locked === 'true',
    };
    return this.service.findAll(user, normalized);
  }

  @Get(':id')
  @Roles('Admin', 'Superadmin')
  findOne(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(user, id);
  }

  @Patch(':id')
  @Roles('Admin', 'Superadmin')
  update(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.service.update(user, id, dto);
  }



  @Patch('me/password')
  changeMyPassword(@AuthUser() user: UserContext, @Body() dto: ChangePasswordDto) {
    return this.service.changeOwnPassword(user, dto);
  }
}
