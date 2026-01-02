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
import { ActivityLogService } from '../services/activity-log.service';
import { assertStrongPassword, generateStrongPassword } from '../../common/security/password';

const SHARABLE_ROLES = new Set<UserType>(['Association', 'Driver']);

function canCreateOrUpdateRole(acting: UserType, target: UserType): boolean {
  if (acting === UserType.Superadmin) {
    return target === UserType.Admin || target === UserType.Controller || target === UserType.Association;
  }
  if (acting === UserType.Admin) {
    return target === UserType.Controller || target === UserType.Association;
  }
  return false;
}

function canReadRole(acting: UserType, target: UserType): boolean {
  if (acting === UserType.Superadmin) return true;
  if (acting === UserType.Admin) return target === UserType.Controller || target === UserType.Association;
  return false;
}

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    private readonly prisma: PrismaService,
    private readonly activityLog: ActivityLogService,
  ) {}

  async create(ctx: UserContext, dto: CreateUserDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    if (dto.user_type === UserType.Superadmin) {
      throw new ForbiddenException('Superadmin can only be created by seeding');
    }

    if (!canCreateOrUpdateRole(ctx.user_type as UserType, dto.user_type)) {
      throw new ForbiddenException(`You cannot create user_type ${dto.user_type}`);
    }

    const siblings = await this.prisma.user.findMany({
      where: { phone_number: dto.phone_number },
      select: { id: true, user_type: true },
    });

    if (siblings.length > 0) {
      const rolesOnPhone = new Set<UserType>(siblings.map((s) => s.user_type));
      const isAllSharable = Array.from(rolesOnPhone).every((r) => SHARABLE_ROLES.has(r));
      const creatingSharable = SHARABLE_ROLES.has(dto.user_type);

      if (!(isAllSharable && creatingSharable)) {
        throw new BadRequestException('Phone number is already in use');
      }

      if (rolesOnPhone.has(dto.user_type)) {
        throw new BadRequestException('This phone and role already exist');
      }
    }

    let associationId: number | null = null;
    if (dto.user_type === UserType.Association || dto.user_type === UserType.Driver) {
      if (dto.association_id == null) throw new BadRequestException('association_id is required');
      const assoc = await this.prisma.association.findUnique({ where: { id: dto.association_id } });
      if (!assoc) throw new BadRequestException('association not found');
      associationId = dto.association_id;
    }

    const temp_password = generateStrongPassword();
    assertStrongPassword(temp_password, dto.phone_number);

    const password_hash = await bcrypt.hash(temp_password, 12);

    const created = await this.users.create({
      phone_number: dto.phone_number,
      user_type: dto.user_type,
      name: dto.name ?? null,
      association_id: associationId,
      password_hash,
    });

    await this.users.update(created.id, { must_change_password: true });

    await this.activityLog.log(ctx, {
      module: 'User',
      action: 'CREATE',
      entity: 'User',
      entity_id: created.id,
    });

    return { user: created, temp_password };
  }

  async findAll(ctx: UserContext, raw: UserFilter) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const filter: UserFilter = { ...raw };
    const list = await this.users.findAll(filter);

    if (ctx.user_type === UserType.Superadmin) return list;
    return list.filter((u) => canReadRole(ctx.user_type as UserType, u.user_type));
  }

  async findOne(ctx: UserContext, id: number) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (!canReadRole(ctx.user_type as UserType, user.user_type)) {
      throw new ForbiddenException('Insufficient privileges');
    }

    return user;
  }

  async update(ctx: UserContext, id: number, dto: UpdateUserDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    if (!canReadRole(ctx.user_type as UserType, existing.user_type)) {
      throw new ForbiddenException('Insufficient privileges');
    }

    if (id === ctx.userId && dto.is_locked !== undefined) {
      throw new ForbiddenException('You cannot lock yourself');
    }

    if (existing.user_type === UserType.Superadmin) {
      if (dto.user_type !== undefined && dto.user_type !== UserType.Superadmin) {
        throw new ForbiddenException('Superadmin role cannot be changed');
      }
      if (dto.phone_number !== undefined && dto.phone_number !== existing.phone_number) {
        throw new ForbiddenException('Superadmin phone_number cannot be changed');
      }
    }

    if (dto.user_type === UserType.Superadmin) {
      throw new ForbiddenException('Superadmin can only be created by seeding');
    }

    const nextPhone = dto.phone_number ?? existing.phone_number;
    const nextRole = (dto.user_type as UserType | undefined) ?? existing.user_type;

    if (nextRole !== existing.user_type) {
      if (!canCreateOrUpdateRole(ctx.user_type as UserType, nextRole)) {
        throw new ForbiddenException(`You cannot set user_type ${nextRole}`);
      }
    }

    if (nextPhone !== existing.phone_number || nextRole !== existing.user_type) {
      const siblings = await this.prisma.user.findMany({
        where: { phone_number: nextPhone, NOT: { id } },
        select: { id: true, user_type: true },
      });

      if (siblings.length > 0) {
        const rolesOnPhone = new Set<UserType>(siblings.map((s) => s.user_type));
        const isAllSharable = Array.from(rolesOnPhone).every((r) => SHARABLE_ROLES.has(r));
        const nextIsSharable = SHARABLE_ROLES.has(nextRole);

        if (!(isAllSharable && nextIsSharable)) {
          throw new BadRequestException('Phone number is already in use');
        }

        if (rolesOnPhone.has(nextRole)) {
          throw new BadRequestException('This phone and role already exist');
        }
      }
    }

    let finalAssociationId: number | null = existing.association_id ?? null;
    if (nextRole === UserType.Association || nextRole === UserType.Driver) {
      const candidate = dto.association_id ?? existing.association_id;
      if (candidate == null) throw new BadRequestException('association_id is required');
      const assoc = await this.prisma.association.findUnique({ where: { id: candidate } });
      if (!assoc) throw new BadRequestException('association not found');
      finalAssociationId = candidate;
    } else {
      finalAssociationId = null;
    }

    const updated = await this.users.update(id, {
      phone_number: nextPhone,
      user_type: nextRole,
      name: dto.name !== undefined ? dto.name : existing.name,
      is_locked: dto.is_locked ?? existing.is_locked,
      association_id: finalAssociationId,
    });

    await this.activityLog.log(ctx, {
      module: 'User',
      action: 'UPDATE',
      entity: 'User',
      entity_id: id,
    });

    return updated;
  }

  async remove(ctx: UserContext, id: number) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (id === ctx.userId) throw new ForbiddenException('You cannot delete yourself');

    if (user.user_type === UserType.Superadmin) {
      throw new ForbiddenException('Superadmin cannot be deleted');
    }

    if (!canCreateOrUpdateRole(ctx.user_type as UserType, user.user_type)) {
      throw new ForbiddenException('Insufficient privileges');
    }

    const deleted = await this.users.remove(id);

    await this.activityLog.log(ctx, {
      module: 'User',
      action: 'DELETE',
      entity: 'User',
      entity_id: id,
    });

    return deleted;
  }

  async changeOwnPassword(ctx: UserContext, dto: ChangePasswordDto) {
    const me = await this.users.findById(ctx.userId);
    if (!me || !me.password_hash) throw new NotFoundException('User not found');

    const ok = await bcrypt.compare(dto.old_password, me.password_hash);
    if (!ok) throw new BadRequestException('old password is incorrect');

    assertStrongPassword(dto.new_password, me.phone_number);
    const new_hash = await bcrypt.hash(dto.new_password, 12);

    await this.users.update(ctx.userId, {
      password_hash: new_hash,
      must_change_password: false,
      failed_login_attempts: 0,
      locked_until: null,
      is_locked: false,
    });

    await this.activityLog.log(ctx, {
      module: 'User',
      action: 'CHANGE_PASSWORD',
      entity: 'User',
      entity_id: ctx.userId,
    });

    return { success: true };
  }

  async resetPasswordByAdmin(ctx: UserContext, id: number) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const target = await this.users.findById(id);
    if (!target) throw new NotFoundException('User not found');

    if (target.user_type === UserType.Superadmin) {
      throw new ForbiddenException('Superadmin password cannot be reset here');
    }

    if (!canReadRole(ctx.user_type as UserType, target.user_type)) {
      throw new ForbiddenException('Insufficient privileges');
    }

    const temp_password = generateStrongPassword();
    assertStrongPassword(temp_password, target.phone_number);
    const password_hash = await bcrypt.hash(temp_password, 12);

    await this.users.update(id, {
      password_hash,
      must_change_password: true,
      failed_login_attempts: 0,
      locked_until: null,
      is_locked: false,
    });

    await this.activityLog.log(ctx, {
      module: 'User',
      action: 'RESET_PASSWORD',
      entity: 'User',
      entity_id: id,
    });

    return { temp_password };
  }
}
