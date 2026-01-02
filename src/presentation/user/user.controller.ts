import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { UserType } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) { }

  private toSafeUser(u: any) {
    return {
      id: u.id,
      phone_number: u.phone_number,
      user_type: u.user_type as UserType,
      name: u.name ?? null,
      association_id: u.association_id ?? null,
      is_locked: !!u.is_locked,
      created_at: u.created_at,
      updated_at: u.updated_at,
    };
  }

  @Post()
  @Roles('Admin', 'Superadmin')
  async create(@AuthUser() user: UserContext, @Body() dto: CreateUserDto) {
    const result = await this.service.create(user, dto);
    return {
      user: this.toSafeUser(result.user),
      temp_password: result.temp_password,
    };
  }


  @Get()
  @Roles('Admin', 'Superadmin')
  async findAll(@AuthUser() user: UserContext, @Query() filter: UserFilterDto) {
    const normalized = {
      ...filter,
      is_locked: filter.is_locked === undefined ? undefined : filter.is_locked === 'true',
    };
    const list = await this.service.findAll(user, normalized);
    return list.map((u) => this.toSafeUser(u));
  }

  @Get(':id')
  @Roles('Admin', 'Superadmin')
  async findOne(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    const u = await this.service.findOne(user, id);
    return this.toSafeUser(u);
  }

  @Patch(':id')
  @Roles('Admin', 'Superadmin')
  async update(
    @AuthUser() user: UserContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const updated = await this.service.update(user, id, dto);
    return this.toSafeUser(updated);
  }

  @Delete(':id')
  @Roles('Admin', 'Superadmin')
  async remove(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    const removed = await this.service.remove(user, id);
    return this.toSafeUser(removed);
  }

  @Post(':id/reset-password')
  @Roles('Admin', 'Superadmin')
  async resetPassword(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.resetPasswordByAdmin(user, id);
  }


  @Patch('me/password')
  async changeMyPassword(@AuthUser() user: UserContext, @Body() dto: ChangePasswordDto) {
    return this.service.changeOwnPassword(user, dto);
  }
}
