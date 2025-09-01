import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ASSOCIATION_REPOSITORY, AssociationFilter } from '../../domain/repositories/association.repository';
import type { IAssociationRepository } from '../../domain/repositories/association.repository';
import { CreateAssociationDto } from '../../presentation/association/dto/create-association.dto';
import { UpdateAssociationDto } from '../../presentation/association/dto/update-association.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AssociationStatus, OwnerStatus, DriverStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class AssociationService {
  constructor(
    @Inject(ASSOCIATION_REPOSITORY) private readonly associations: IAssociationRepository,
    private readonly prisma: PrismaService,
  ) { }

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
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    return this.associations.create({
      name: dto.name,
      phone_number: dto.phone_number ?? null,
      logo: dto.logo ?? null,
    });
  }

  // UPDATE: Admin/Superadmin only; if status changes → lock/unlock cascade
  async update(ctx: UserContext, id: number, dto: UpdateAssociationDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const existing = await this.associations.findById(id);
    if (!existing) throw new NotFoundException('Association not found');

    const statusChanging = dto.status && dto.status !== existing.status;

    // Update association first
    const updated = await this.associations.update(id, {
      name: dto.name ?? existing.name,
      phone_number: dto.phone_number !== undefined ? dto.phone_number : existing.phone_number,
      logo: dto.logo !== undefined ? dto.logo : existing.logo,
      status: dto.status ?? existing.status,
    });

    // If status changed, cascade lock/unlock users in this association
    if (statusChanging) {
      if (updated.status === AssociationStatus.SUSPENDED) {
        await this.lockUsersForAssociation(id);
      } else if (updated.status === AssociationStatus.ACTIVE) {
        await this.unlockUsersForAssociation(id);
      }
    }

    return updated;
  }

  // ---- Helpers: lock/unlock all users "inside" the association ----
  private async lockUsersForAssociation(associationId: number) {
    // Get user ids from Owners and Drivers of this association
    const [owners, drivers] = await Promise.all([
      this.prisma.owner.findMany({ where: { association_id: associationId }, select: { user_id: true } }),
      this.prisma.driver.findMany({ where: { association_id: associationId }, select: { user_id: true } }),
    ]);
    const ownerUserIds = owners.map(o => o.user_id);
    const driverUserIds = drivers.map(d => d.user_id);

    // Lock:
    await this.prisma.$transaction([
      // 1) Association "account" users (user_type = Association)
      this.prisma.user.updateMany({
        where: { association_id: associationId, user_type: 'Association' },
        data: { is_locked: true },
      }),
      // 2) Owner-linked users
      ownerUserIds.length
        ? this.prisma.user.updateMany({
          where: { id: { in: ownerUserIds } },
          data: { is_locked: true },
        })
        : this.prisma.user.updateMany({
          where: { id: { in: [] } },
          data: { is_locked: true },
        }),
      // 3) Driver-linked users
      driverUserIds.length
        ? this.prisma.user.updateMany({
          where: { id: { in: driverUserIds } },
          data: { is_locked: true },
        })
        : this.prisma.user.updateMany({
          where: { id: { in: [] } },
          data: { is_locked: true },
        }),
    ]);
  }

  private async unlockUsersForAssociation(associationId: number) {
    // Fetch ONLY owners/drivers that are NOT suspended
    const [owners, drivers] = await Promise.all([
      this.prisma.owner.findMany({
        where: { association_id: associationId, NOT: { status: OwnerStatus.SUSPENDED } },
        select: { user_id: true },
      }),
      this.prisma.driver.findMany({
        where: { association_id: associationId, NOT: { status: DriverStatus.SUSPENDED } },
        select: { user_id: true },
      }),
    ]);

    const ownerUserIds = owners.map(o => o.user_id);
    const driverUserIds = drivers.map(d => d.user_id);

    const ops = [
      // Always unlock association "account" users when association is ACTIVE again
      this.prisma.user.updateMany({
        where: { association_id: associationId, user_type: 'Association' },
        data: { is_locked: false },
      }),
    ];

    if (ownerUserIds.length) {
      ops.push(
        this.prisma.user.updateMany({
          where: { id: { in: ownerUserIds } },
          data: { is_locked: false },
        }),
      );
    }

    if (driverUserIds.length) {
      ops.push(
        this.prisma.user.updateMany({
          where: { id: { in: driverUserIds } },
          data: { is_locked: false },
        }),
      );
    }

    await this.prisma.$transaction(ops);
  }
}
