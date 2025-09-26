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
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DriverStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';

@Injectable()
export class AssociationService {
  constructor(
    @Inject(ASSOCIATION_REPOSITORY)
    private readonly associations: IAssociationRepository,
    private readonly prisma: PrismaService,
  ) {}

  // PUBLIC list (no auth required)
  publicList(filter?: AssociationFilter) {
    return this.associations.findAll(filter);
  }

  // PUBLIC get by id (no auth required)
  async publicGet(id: number) {
    const a = await this.associations.findById(id);
    if (!a) throw new NotFoundException('Association not found');
    return a;
  }

  // CREATE: Admin/Superadmin only
  async create(ctx: UserContext, dto: CreateAssociationDto) {
    if (!isAdminLike(ctx.user_type))
      throw new ForbiddenException('Only Admin/Superadmin');

    return this.associations.create({
      name: dto.name,
      phone_number: dto.phone_number ?? null,
      logo: dto.logo ?? null,
    });
  }

  // UPDATE: Admin/Superadmin only
  async update(ctx: UserContext, id: number, dto: UpdateAssociationDto) {
    if (!isAdminLike(ctx.user_type))
      throw new ForbiddenException('Only Admin/Superadmin');

    const existing = await this.associations.findById(id);
    if (!existing) throw new NotFoundException('Association not found');

    return this.associations.update(id, {
      name: dto.name ?? existing.name,
      phone_number:
        dto.phone_number !== undefined ? dto.phone_number : existing.phone_number,
      logo: dto.logo !== undefined ? dto.logo : existing.logo,
    });
  }

  // DELETE: Admin/Superadmin only (hard delete with cascade)
  async delete(ctx: UserContext, id: number) {
    if (!isAdminLike(ctx.user_type))
      throw new ForbiddenException('Only Admin/Superadmin');

    const existing = await this.associations.findById(id);
    if (!existing) throw new NotFoundException('Association not found');

    await this.prisma.$transaction(async (tx) => {
      // Delete dependent entities in correct order
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

    return { message: 'Association and all related records deleted successfully' };
  }
}
