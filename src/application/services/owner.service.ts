import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OWNER_REPOSITORY } from '../../domain/repositories/owner.repository';
import type { IOwnerRepository } from '../../domain/repositories/owner.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOwnerDto } from '../../presentation/owner/dto/create-owner.dto';
import { UpdateOwnerDto } from '../../presentation/owner/dto/update-owner.dto';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';
import { ActivityLogService } from './activity-log.service';

@Injectable()
export class OwnerService {
  constructor(
    @Inject(OWNER_REPOSITORY) private readonly owners: IOwnerRepository,
    private readonly prisma: PrismaService,
    private readonly activityLog: ActivityLogService,
  ) {}

  async create(ctx: UserContext, dto: CreateOwnerDto) {
    if (isAdminLike(ctx.user_type))
      throw new ForbiddenException('Admin/Superadmin cannot create owners');
    if (!ctx.association_id)
      throw new BadRequestException('association_id is required');

    const assoc = await this.prisma.association.findUnique({
      where: { id: ctx.association_id },
    });
    if (!assoc) throw new BadRequestException('association not found');

    const owner = await this.prisma.$transaction((tx) =>
      this.owners.create(
        ctx,
        {
          association_id: ctx.association_id!,
          full_name: dto.full_name,
          phone_number: dto.phone_number,
        },
        tx,
      ),
    );

    await this.activityLog.log(ctx, {
      module: 'Owner',
      action: 'CREATE',
      entity: 'Owner',
      entity_id: owner.id,
    });

    return owner;
  }

  findAll(ctx: UserContext, association_id?: number) {
    return this.owners.findAll(ctx, association_id);
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

    const existing = await this.owners.findById(ctx, id);
    if (!existing) throw new NotFoundException('Owner not found');

    const patch: any = {};
    if (dto.full_name !== undefined) patch.full_name = dto.full_name;
    if (dto.phone_number !== undefined) patch.phone_number = dto.phone_number;

    const updated = await this.owners.update(ctx, id, patch);

    await this.activityLog.log(ctx, {
      module: 'Owner',
      action: 'UPDATE',
      entity: 'Owner',
      entity_id: updated.id,
    });

    return updated;
  }

  async remove(ctx: UserContext, id: number) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot delete owners');
    }

    const owner = await this.owners.findById(ctx, id);
    if (!owner) throw new NotFoundException('Owner not found');

    const deleted = await this.owners.remove(ctx, id);

    await this.activityLog.log(ctx, {
      module: 'Owner',
      action: 'DELETE',
      entity: 'Owner',
      entity_id: deleted.id,
    });

    return deleted;
  }
}
