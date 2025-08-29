import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OWNER_REPOSITORY } from '../../domain/repositories/owner.repository';
import type { IOwnerRepository } from '../../domain/repositories/owner.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { Owner } from '../../domain/entities/owner.entity';

type CreateOwnerInput = {
  association_id: number;     // provided by guard (URL/JWT)
  full_name: string;
  phone_number: string;       // also used as password
};

type UpdateOwnerInput = {
  id: number;
  association_id: number;     // provided by guard (URL/JWT) to enforce scope
  full_name?: string;
  phone_number?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
};

@Injectable()
export class OwnerService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OWNER_REPOSITORY) private readonly owners: IOwnerRepository,
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
  ) { }

  async createOwner(input: CreateOwnerInput): Promise<Owner> {
    // 0) ensure association exists
    const assoc = await this.prisma.association.findUnique({ where: { id: input.association_id } });
    if (!assoc) throw new BadRequestException('association not found');

    // 1) phone unique globally (users)
    const userWithPhone = await this.users.findByPhone(input.phone_number);
    if (userWithPhone) throw new ConflictException('phone_number already used by another user');

    // 2) phone unique per association (owners)
    const dupOwner = await this.prisma.owner.findFirst({
      where: { association_id: input.association_id, phone_number: input.phone_number },
    });
    if (dupOwner) throw new ConflictException('phone_number already used in this association');

    // 3) create user of type Owner (default is_locked=true via schema)
    const hash = await bcrypt.hash(input.phone_number, 10);
    const user = await this.users.createWithPassword(
      input.phone_number,
      'Owner',
      hash,
      input.full_name,
      input.association_id,
    );

    // 4) create owner row
    const owner = await this.owners.create({
      user_id: user.id,
      association_id: input.association_id,
      full_name: input.full_name,
      phone_number: input.phone_number,
      status: 'ACTIVE',
    });

    return owner;
  }

  async getByIdScoped(id: number, association_id: number): Promise<Owner> {
    const o = await this.owners.findById(id);
    if (!o || o.association_id !== association_id) throw new NotFoundException('owner not found');
    return o;
  }

  async list(params: {
    association_id: number;
    skip?: number;
    take?: number;
    status?: 'ACTIVE' | 'SUSPENDED';
    search?: string;
  }): Promise<Owner[]> {
    return this.owners.list({
      association_id: params.association_id,
      skip: params.skip,
      take: params.take,
      status: params.status,
      search: params.search,
    });
  }

  async updateOwner(input: UpdateOwnerInput): Promise<Owner> {
    const current = await this.owners.findById(input.id);
    if (!current || current.association_id !== input.association_id) {
      throw new NotFoundException('owner not found');
    }

    // If phone changes, check uniqueness (users + per-assoc)
    if (input.phone_number && input.phone_number !== current.phone_number) {
      const u = await this.users.findByPhone(input.phone_number);
      if (u) throw new ConflictException('phone_number already used by another user');

      const dup = await this.prisma.owner.findFirst({
        where: { association_id: input.association_id, phone_number: input.phone_number },
      });
      if (dup) throw new ConflictException('phone_number already used in this association');
    }

    // Update linked user if name/phone changed (keep association_id)
    if (input.full_name || input.phone_number) {
      await this.users.updateUser(current.user_id, {
        phone_number: input.phone_number ?? undefined,
        name: input.full_name ?? undefined,
      });
    }

    // If status -> SUSPENDED => lock the user
    if (input.status === 'SUSPENDED') {
      await this.users.updateUser(current.user_id, { is_locked: true });
    }

    // Update owner
    const updated = await this.owners.update(input.id, {
      full_name: input.full_name,
      phone_number: input.phone_number,
      status: input.status,
    });

    return updated;
  }

  async deleteOwner(id: number, association_id: number): Promise<void> {
    const current = await this.owners.findById(id);
    if (!current || current.association_id !== association_id) {
      throw new NotFoundException('owner not found');
    }
    await this.users.updateUser(current.user_id, { is_locked: true });
    await this.owners.delete(id);
  }
}
