import { Inject, Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OWNER_REPOSITORY } from '../../domain/repositories/owner.repository';
import type { IOwnerRepository } from '../../domain/repositories/owner.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateOwnerDto } from '../../presentation/owner/dto/create-owner.dto';
import { UpdateOwnerDto } from '../../presentation/owner/dto/update-owner.dto';
import * as bcrypt from 'bcrypt';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class OwnerService {
  constructor(
    @Inject(OWNER_REPOSITORY) private readonly owners: IOwnerRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(ctx: UserContext, dto: CreateOwnerDto) {
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create owners');
    if (!ctx.association_id) throw new BadRequestException('association_id is required');

    const assoc = await this.prisma.association.findUnique({ where: { id: ctx.association_id } });
    if (!assoc) throw new BadRequestException('association not found');

    return this.prisma.$transaction(async (tx) => {
      const password_hash = await bcrypt.hash(dto.phone_number, 10);

      // ✅ Save association_id on the user record (cannot be null)
      const user = await tx.user.create({
        data: {
          phone_number: dto.phone_number,
          user_type: 'Owner',
          name: dto.full_name,
          password_hash,
          is_locked: false,
          association_id: ctx.association_id!, // <-- set association here
        },
      });

      // pass tx to repo so both writes are in the SAME transaction
      const owner = await this.owners.create(
        ctx,
        {
          association_id: ctx.association_id!,
          full_name: dto.full_name,
          phone_number: dto.phone_number,
          user_id: user.id,
        },
        tx,
      );

      return owner;
    });
  }

  findAll(ctx: UserContext) {
    // Admin/Superadmin: read OK (scoped in repo to all)
    // Association: read own association only
    return this.owners.findAll(ctx);
  }

  async findOne(ctx: UserContext, id: number) {
    const owner = await this.owners.findById(ctx, id);
    if (!owner) throw new NotFoundException('Owner not found');
    return owner;
  }

  async update(ctx: UserContext, id: number, dto: UpdateOwnerDto) {
    // Only Association users may update
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot update owners');
    }

    const owner = await this.owners.findById(ctx, id);
    if (!owner) throw new NotFoundException('Owner not found');

    // Prepare patch
    const patch: any = {};
    if (dto.full_name !== undefined) patch.full_name = dto.full_name;
    if (dto.phone_number !== undefined) patch.phone_number = dto.phone_number;
    if (dto.status !== undefined) patch.status = dto.status;

    const updated = await this.owners.update(ctx, id, patch);

    // Sync linked user
    const userPatch: any = {};
    if (dto.full_name !== undefined) userPatch.name = dto.full_name;
    if (dto.phone_number !== undefined) userPatch.phone_number = dto.phone_number;
    if (dto.status === 'SUSPENDED') userPatch.is_locked = true;

    if (Object.keys(userPatch).length > 0) {
      await this.prisma.user.update({
        where: { id: owner.user_id },
        data: userPatch,
      });
    }

    return updated;
  }
}
