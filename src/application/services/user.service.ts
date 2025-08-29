import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

type Actor = { id: number; user_type: User['user_type'] };

type RegisterUserInput = {
  phone_number: string;
  user_type: User['user_type'];
  password: string;
  name?: string | null;
  association_id?: number | null;
};

type ChangePasswordInput = {
  user_id: number;
  old_password: string;
  new_password: string;
};

type UpdateUserInput = {
  id: number;
  phone_number?: string;
  user_type?: User['user_type'];
  name?: string | null;
  is_locked?: boolean;
  association_id?: number | null;
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  private assertCanManageTarget(actor: Actor, targetUserType: User['user_type']) {
    if (actor.user_type === 'Superadmin') return;
    if (actor.user_type === 'Admin') {
      if (targetUserType === 'Superadmin' || targetUserType === 'Admin') {
        throw new ForbiddenException('Admins cannot manage superadmin/admin users');
      }
      return;
    }
    throw new ForbiddenException('Not permitted');
  }

  private sanitizeListForActor(actor: Actor, list: User[]): User[] {
    if (actor.user_type === 'Superadmin') return list;
    if (actor.user_type === 'Admin') {
      return list.filter(u => u.user_type !== 'Superadmin' && u.user_type !== 'Admin');
    }
    throw new ForbiddenException('Not permitted');
  }

  async registerUser(actor: Actor, input: RegisterUserInput): Promise<User> {
    this.assertCanManageTarget(actor, input.user_type);

    const exists = await this.users.findByPhone(input.phone_number);
    if (exists) throw new ConflictException('phone_number already in use');

    if (input.user_type === 'Association') {
      if (!input.association_id) throw new BadRequestException('association_id is required for Association users');
      const assoc = await this.prisma.association.findUnique({ where: { id: input.association_id } });
      if (!assoc) throw new BadRequestException('association not found');
    }

    const hash = await bcrypt.hash(input.password, 10);
    return this.users.createWithPassword(
      input.phone_number,
      input.user_type,
      hash,
      input.name ?? null,
      input.user_type === 'Association' ? input.association_id! : null,
    );
  }

  async changePassword(input: ChangePasswordInput): Promise<void> {
    const user = await this.users.findById(input.user_id);
    if (!user || !user.password_hash) throw new UnauthorizedException('invalid user');

    const ok = await bcrypt.compare(input.old_password, user.password_hash);
    if (!ok) throw new ForbiddenException('old_password is incorrect');

    const new_hash = await bcrypt.hash(input.new_password, 10);
    await this.users.updatePassword(user.id, new_hash);
  }

  async getUserById(actor: Actor, id: number): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('user not found');
    if (actor.user_type === 'Admin' && (user.user_type === 'Superadmin' || user.user_type === 'Admin')) {
      throw new ForbiddenException('forbidden');
    }
    if (actor.user_type !== 'Superadmin' && actor.user_type !== 'Admin') {
      throw new ForbiddenException('forbidden');
    }
    return user;
  }

  async updateUser(actor: Actor, input: UpdateUserInput): Promise<User> {
    const current = await this.users.findById(input.id);
    if (!current) throw new NotFoundException('user not found');

    const targetType = input.user_type ?? current.user_type;
    this.assertCanManageTarget(actor, targetType);

    if (input.phone_number) {
      const existing = await this.users.findByPhone(input.phone_number);
      if (existing && existing.id !== input.id) {
        throw new ConflictException('phone_number already in use');
      }
    }

    if (targetType === 'Association') {
      if (input.association_id !== undefined) {
        if (input.association_id === null) throw new BadRequestException('association_id cannot be null for Association users');
        const assoc = await this.prisma.association.findUnique({ where: { id: input.association_id } });
        if (!assoc) throw new BadRequestException('association not found');
      } else if (!current.association_id) {
        throw new BadRequestException('association_id is required for Association users');
      }
    }

    return this.users.updateUser(input.id, {
      phone_number: input.phone_number,
      user_type: input.user_type,
      name: input.name ?? undefined,
      is_locked: input.is_locked,
      association_id: input.association_id,
    });
  }

  async listUsers(actor: Actor, params?: { skip?: number; take?: number; association_id?: number }): Promise<User[]> {
    if (actor.user_type !== 'Superadmin' && actor.user_type !== 'Admin') {
      throw new ForbiddenException('forbidden');
    }
    const list = await this.users.list(params);
    return this.sanitizeListForActor(actor, list);
  }
}
