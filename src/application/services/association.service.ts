import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ASSOCIATION_REPOSITORY,
  AssociationFilter,
  type IAssociationRepository,
} from '../../domain/repositories/association.repository';
import { CreateAssociationDto } from '../../presentation/association/dto/create-association.dto';
import { UpdateAssociationDto } from '../../presentation/association/dto/update-association.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';
import { ActivityLogService } from '../services/activity-log.service';

@Injectable()
export class AssociationService {
  constructor(
    @Inject(ASSOCIATION_REPOSITORY)
    private readonly associations: IAssociationRepository,
    private readonly prisma: PrismaService,
    private readonly activityLog: ActivityLogService,
  ) {}

  publicList(filter?: AssociationFilter) {
    return this.associations.findAll(filter);
  }

  async publicGet(id: number) {
    const a = await this.associations.findById(id);
    if (!a) throw new NotFoundException('Association not found');
    return a;
  }

  async create(ctx: UserContext, dto: CreateAssociationDto) {
    if (!isAdminLike(ctx.user_type))
      throw new ForbiddenException('Only Admin/Superadmin');

    const assoc = await this.associations.create({
      name: dto.name,
      phone_number: dto.phone_number ?? null,
      logo: dto.logo ?? null,
    });

    await this.activityLog.log(ctx, {
      module: 'Association',
      action: 'CREATE',
      entity: 'Association',
      entity_id: assoc.id,
    });

    return assoc;
  }

  async update(ctx: UserContext, id: number, dto: UpdateAssociationDto) {
    if (!isAdminLike(ctx.user_type))
      throw new ForbiddenException('Only Admin/Superadmin');

    const existing = await this.associations.findById(id);
    if (!existing) throw new NotFoundException('Association not found');

    const updated = await this.associations.update(id, {
      name: dto.name ?? existing.name,
      phone_number:
        dto.phone_number !== undefined ? dto.phone_number : existing.phone_number,
      logo: dto.logo !== undefined ? dto.logo : existing.logo,
    });

    await this.activityLog.log(ctx, {
      module: 'Association',
      action: 'UPDATE',
      entity: 'Association',
      entity_id: updated.id,
    });

    return updated;
  }

  async delete(ctx: UserContext, id: number) {
    if (!isAdminLike(ctx.user_type))
      throw new ForbiddenException('Only Admin/Superadmin');

    const existing = await this.associations.findById(id);
    if (!existing) throw new NotFoundException('Association not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.driverPayment.deleteMany({ where: { association_id: id } });
      await tx.associationPolicy.deleteMany({ where: { association_id: id } });
      await tx.routeAssignment.deleteMany({ where: { association_id: id } });
      await tx.routeQuota.deleteMany({ where: { association_id: id } });
      await tx.vehicle.deleteMany({ where: { association_id: id } });
      await tx.driver.deleteMany({ where: { association_id: id } });
      await tx.owner.deleteMany({ where: { association_id: id } });
      await tx.user.deleteMany({ where: { association_id: id } });
      await tx.association.delete({ where: { id } });
    });

    await this.activityLog.log(ctx, {
      module: 'Association',
      action: 'DELETE',
      entity: 'Association',
      entity_id: id,
    });

    return { message: 'Association and all related records deleted successfully' };
  }
}
