import { Inject, Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OWNER_REPOSITORY } from '../../domain/repositories/owner.repository';
import type { IOwnerRepository } from '../../domain/repositories/owner.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateOwnerDto } from '../../presentation/owner/dto/create-owner.dto';
import { UpdateOwnerDto } from '../../presentation/owner/dto/update-owner.dto';
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
      return this.owners.create(
        ctx,
        {
          association_id: ctx.association_id!,
          full_name: dto.full_name,
          phone_number: dto.phone_number,
        },
        tx,
      );
    });
  }

  findAll(ctx: UserContext) {
    return this.owners.findAll(ctx);
  }

  async findOne(ctx: UserContext, id: number) {
    const owner = await this.owners.findById(ctx, id);
    if (!owner) throw new NotFoundException('Owner not found');
    return owner;
  }

  async update(ctx: UserContext, id: number, dto: UpdateOwnerDto) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot update owners');
    }

    const owner = await this.owners.findById(ctx, id);
    if (!owner) throw new NotFoundException('Owner not found');

    const patch: any = {};
    if (dto.full_name !== undefined) patch.full_name = dto.full_name;
    if (dto.phone_number !== undefined) patch.phone_number = dto.phone_number;
    if (dto.status !== undefined) patch.status = dto.status;

    return this.owners.update(ctx, id, patch);
  }
}
