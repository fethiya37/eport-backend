import {
  Inject,
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { USER_REPOSITORY, UserFilter } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../../presentation/user/dto/create-user.dto';
import { UpdateUserDto } from '../../presentation/user/dto/update-user.dto';
import { ChangePasswordDto } from '../../presentation/user/dto/change-password.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

function canManage(acting: UserType, target: UserType): boolean {
  if (acting === 'Superadmin') return ['Superadmin', 'Admin', 'Controller', 'Association'].includes(target);
  if (acting === 'Admin') return ['Controller', 'Association'].includes(target);
  return false;
}

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    private readonly prisma: PrismaService,
  ) { }

  // CREATE
  async create(ctx: UserContext, dto: CreateUserDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');
    if (!canManage(ctx.user_type as UserType, dto.user_type)) {
      throw new ForbiddenException(`You cannot create user_type ${dto.user_type}`);
    }

    const existing = await this.prisma.user.findUnique({ where: { phone_number: dto.phone_number } });
    if (existing) throw new BadRequestException('Phone number already exists');

    let associationId: number | null = null;
    if (dto.user_type === 'Association') {
      if (dto.association_id == null) throw new BadRequestException('association_id is required');
      const assoc = await this.prisma.association.findUnique({ where: { id: dto.association_id } });
      if (!assoc) throw new BadRequestException('association not found');
      associationId = dto.association_id;
    }

    const password_hash = await bcrypt.hash(dto.phone_number, 10);

    return this.users.create({
      phone_number: dto.phone_number,
      user_type: dto.user_type,
      name: dto.name ?? null,
      association_id: associationId,
      password_hash,
    });
  }

  // LIST
  async findAll(ctx: UserContext, raw: UserFilter) {
    const filter: UserFilter = { ...raw };
    if (ctx.user_type === 'Admin' && filter.user_type && !canManage('Admin', filter.user_type)) {
      return [];
    }

    const list = await this.users.findAll(filter);
    return ctx.user_type === 'Superadmin'
      ? list
      : list.filter(u => canManage(ctx.user_type as UserType, u.user_type));
  }

  async findOne(ctx: UserContext, id: number) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');
    if (!canManage(ctx.user_type as UserType, user.user_type)) {
      throw new ForbiddenException('Insufficient privileges');
    }
    return user;
  }

  // UPDATE
  async update(ctx: UserContext, id: number, dto: UpdateUserDto) {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundException('User not found');
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');
    if (!canManage(ctx.user_type as UserType, existing.user_type)) {
      throw new ForbiddenException('Insufficient privileges');
    }

    if (id === ctx.userId && dto.is_locked !== undefined) {
      throw new ForbiddenException('You cannot lock yourself');
    }

    // ✅ Prevent duplicate phone number on update
    if (dto.phone_number && dto.phone_number !== existing.phone_number) {
      const dup = await this.prisma.user.findUnique({ where: { phone_number: dto.phone_number } });
      if (dup) throw new BadRequestException('Phone number already exists');
    }

    const finalUserType = dto.user_type ?? existing.user_type;
    let finalAssociationId: number | null;
    if (finalUserType === 'Association') {
      const candidate = dto.association_id ?? existing.association_id;
      if (candidate == null) throw new BadRequestException('association_id is required for Association users');
      const assoc = await this.prisma.association.findUnique({ where: { id: candidate } });
      if (!assoc) throw new BadRequestException('association not found');
      finalAssociationId = candidate;
    } else {
      finalAssociationId = null;
    }

    return this.users.update(id, {
      phone_number: dto.phone_number ?? existing.phone_number,
      user_type: finalUserType,
      name: dto.name !== undefined ? dto.name : existing.name,
      is_locked: dto.is_locked ?? existing.is_locked,
      association_id: finalAssociationId,
    });
  }

  // REMOVE
  async remove(ctx: UserContext, id: number) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');
    if (!canManage(ctx.user_type as UserType, user.user_type)) {
      throw new ForbiddenException('Insufficient privileges');
    }

    if (id === ctx.userId) {
      throw new ForbiddenException('You cannot delete yourself');
    }

    return this.users.remove(id);
  }


  // PROFILE password change
  async changeOwnPassword(ctx: UserContext, dto: ChangePasswordDto) {
    const me = await this.users.findById(ctx.userId);
    if (!me || !me.password_hash) throw new NotFoundException('User not found');

    const ok = await bcrypt.compare(dto.old_password, me.password_hash);
    if (!ok) throw new BadRequestException('old password is incorrect');

    const new_hash = await bcrypt.hash(dto.new_password, 10);
    await this.users.update(ctx.userId, { password_hash: new_hash });
    return { success: true };
  }
}
