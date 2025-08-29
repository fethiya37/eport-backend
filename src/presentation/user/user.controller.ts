import {
  Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Post()
  @Roles('Superadmin', 'Admin')
  @ApiOperation({ summary: 'Register a new user (Association users must include association_id)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async register(@Req() req: any, @Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const actor = { id: req.user.userId, user_type: req.user.user_type };
    const u = await this.users.registerUser(actor, {
      phone_number: dto.phone_number,
      user_type: dto.user_type,
      password: dto.password,
      name: dto.name ?? null,
      association_id: dto.association_id ?? null,
    });
    return {
      id: u.id,
      phone_number: u.phone_number,
      user_type: u.user_type,
      name: u.name,
      association_id: u.association_id,
      is_locked: u.is_locked,           // ✅ boolean
      created_at: u.created_at!,
      updated_at: u.updated_at,
    };
  }

  @Get(':id')
  @Roles('Superadmin', 'Admin')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const actor = { id: req.user.userId, user_type: req.user.user_type };
    const u = await this.users.getUserById(actor, id);
    return {
      id: u.id,
      phone_number: u.phone_number,
      user_type: u.user_type,
      name: u.name,
      association_id: u.association_id,
      is_locked: u.is_locked,           // ✅ boolean
      created_at: u.created_at!,
      updated_at: u.updated_at,
    };
  }

  @Get()
  @Roles('Superadmin', 'Admin')
  @ApiOperation({ summary: 'List users (admins won’t see superadmin/admin)' })
  @ApiResponse({ status: 200, type: UserResponseDto, isArray: true })
  async list(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('association_id') association_id?: string,
  ): Promise<UserResponseDto[]> {
    const actor = { id: req.user.userId, user_type: req.user.user_type };
    const data = await this.users.listUsers(actor, {
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      association_id: association_id ? +association_id : undefined,
    });
    return data.map((u) => ({
      id: u.id,
      phone_number: u.phone_number,
      user_type: u.user_type,
      name: u.name,
      association_id: u.association_id,
      is_locked: u.is_locked,           // ✅ boolean
      created_at: u.created_at!,
      updated_at: u.updated_at,
    }));
  }

  @Patch(':id')
  @Roles('Superadmin', 'Admin')
  @ApiOperation({ summary: 'Update a user (incl. is_locked, association_id for association users)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const actor = { id: req.user.userId, user_type: req.user.user_type };
    const u = await this.users.updateUser(actor, {
      id,
      phone_number: dto.phone_number,
      user_type: dto.user_type,
      name: dto.name ?? undefined,
      is_locked: dto.is_locked,
      association_id: dto.association_id,
    });
    return {
      id: u.id,
      phone_number: u.phone_number,
      user_type: u.user_type,
      name: u.name,
      association_id: u.association_id,
      is_locked: u.is_locked,           // ✅ boolean
      created_at: u.created_at!,
      updated_at: u.updated_at,
    };
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok' } } })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto): Promise<{ status: string }> {
    const userId: number = req.user?.userId ?? req.user?.sub;
    await this.users.changePassword({
      user_id: userId,
      old_password: dto.old_password,
      new_password: dto.new_password,
    });
    return { status: 'ok' };
  }
}
