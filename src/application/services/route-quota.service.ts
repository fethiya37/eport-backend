import {
  Inject,
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import {
  ROUTE_QUOTA_REPOSITORY,
  type IRouteQuotaRepository,
} from '../../domain/repositories/route-quota.repository';
import {
  ASSOCIATION_REPOSITORY,
  type IAssociationRepository,
} from '../../domain/repositories/association.repository';
import {
  ROUTES_REPOSITORY,
  type IRoutesRepository,
} from '../../domain/repositories/route.repository';

import { CreateRouteQuotaDto } from '../../presentation/route-quota/dto/create-route-quota.dto';
import { UpdateRouteQuotaDto } from '../../presentation/route-quota/dto/update-route-quota.dto';
import { RouteQuotaFilterDto } from '../../presentation/route-quota/dto/route-quota-filter.dto';
import { CreateManyRouteQuotasDto } from '../../presentation/route-quota/dto/create-many-route-quotas.dto';

import { isAdminLike } from '../../common/auth/roles.util';
import { PrismaService } from '../../../prisma/prisma.service';
import type { UserContext } from 'src/common/context/user-context';
import { VehicleStatus, RouteQuotaStatus } from '@prisma/client'; // ✅ import enum

@Injectable()
export class RouteQuotaService {
  constructor(
    @Inject(ROUTE_QUOTA_REPOSITORY) private readonly quotas: IRouteQuotaRepository,
    @Inject(ASSOCIATION_REPOSITORY) private readonly associations: IAssociationRepository,
    @Inject(ROUTES_REPOSITORY) private readonly routesRepo: IRoutesRepository,
    private readonly prisma: PrismaService,
  ) { }

  // ========== CREATE ==========
  async create(ctx: UserContext, dto: CreateRouteQuotaDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const [assocOk, routeOk] = await Promise.all([
      this.associations.exists(dto.association_id),
      this.routesRepo.existsRoute(dto.route_id),
    ]);
    if (!assocOk) throw new BadRequestException('Association not found');
    if (!routeOk) throw new BadRequestException('Route not found');

    const start_date = this.parseGc(dto.start_date, 'start_date');
    const end_date = this.parseGc(dto.end_date, 'end_date');
    if (start_date > end_date) throw new BadRequestException('start_date must be <= end_date');

    await this.ensureCapacity(dto.association_id, dto.no_vehicles);
    await this.ensureNoOverlap(dto.association_id, dto.route_id, start_date, end_date);

    return this.quotas.create({
      association_id: dto.association_id,
      route_id: dto.route_id,
      start_date,
      end_date,
      no_vehicles: dto.no_vehicles,
      remaining_vehicles: dto.no_vehicles,
      status: RouteQuotaStatus.Pending, // ✅ use enum
    });
  }

  // ========== CREATE MANY ==========
  async createMany(ctx: UserContext, dto: CreateManyRouteQuotasDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const start_date = this.parseGc(dto.start_date, 'start_date');
    const end_date = this.parseGc(dto.end_date, 'end_date');
    if (start_date > end_date) throw new BadRequestException('start_date must be <= end_date');

    const assocOk = await this.associations.exists(dto.association_id);
    if (!assocOk) throw new BadRequestException('Association not found');

    const activePairs = await this.countActivePairs(dto.association_id);

    const rows: Parameters<IRouteQuotaRepository['createMany']>[0] = [];
    for (const item of dto.items) {
      const routeOk = await this.routesRepo.existsRoute(item.route_id);
      if (!routeOk) throw new BadRequestException(`Route ${item.route_id} not found`);
      if (item.no_vehicles > activePairs) {
        throw new BadRequestException(
          `no_vehicles for route ${item.route_id} exceeds active driver-vehicle pairs`,
        );
      }
      await this.ensureNoOverlap(dto.association_id, item.route_id, start_date, end_date);

      rows.push({
        association_id: dto.association_id,
        route_id: item.route_id,
        start_date,
        end_date,
        no_vehicles: item.no_vehicles,
        remaining_vehicles: item.no_vehicles,
        status: RouteQuotaStatus.Pending, // ✅ enum
      });
    }

    return this.quotas.createMany(rows);
  }

  // ========== FIND ==========
  find(ctx: UserContext, filter: RouteQuotaFilterDto) {
    if (!isAdminLike(ctx.user_type) && ctx.association_id) {
      filter.association_id = ctx.association_id;
    }
    return this.quotas.find(filter);
  }

  // ========== UPDATE ==========
  async update(ctx: UserContext, id: number, dto: UpdateRouteQuotaDto) {
    const existing = await this.quotas.findById(id);
    if (!existing) throw new NotFoundException('Route quota not found');

    // ------------------------------
    // 1️⃣ Role validation
    // ------------------------------
    const isAssociation = ctx.user_type === 'Association';
    const isAdmin = isAdminLike(ctx.user_type);

    if (!isAdmin && !isAssociation) {
      throw new ForbiddenException('Only Admin, Superadmin or Association can update quota');
    }

    // Association-scoped restriction
    if (isAssociation && ctx.association_id !== existing.association_id) {
      throw new ForbiddenException('Cannot modify quota outside your association');
    }

    // Prevent updates on approved quotas
    const approvedCount = await this.prisma.routeAssignment.count({
      where: { route_quota_id: id, status: 'Approved' },
    });
    if (approvedCount > 0 && !isAdmin) {
      // only admin can edit after approval
      throw new ForbiddenException('Cannot update quota with approved assignments');
    }

    // ------------------------------
    // 2️⃣ Build the patch payload
    // ------------------------------
    const patch: Partial<{
      start_date: Date;
      end_date: Date;
      no_vehicles: number;
      remaining_vehicles: number;
      status: RouteQuotaStatus;
    }> = {};

    // ✅ Admin/Superadmin can edit all fields
    if (isAdmin) {
      if (dto.start_date) patch.start_date = this.parseGc(dto.start_date, 'start_date');
      if (dto.end_date) patch.end_date = this.parseGc(dto.end_date, 'end_date');
      if (patch.start_date && patch.end_date && patch.start_date > patch.end_date) {
        throw new BadRequestException('start_date must be <= end_date');
      }

      if (dto.no_vehicles !== undefined) {
        await this.ensureCapacity(existing.association_id, dto.no_vehicles);
        patch.no_vehicles = dto.no_vehicles;
      }

      if (dto.remaining_vehicles !== undefined) {
        if (dto.remaining_vehicles < 0 || dto.remaining_vehicles > (dto.no_vehicles ?? existing.no_vehicles)) {
          throw new BadRequestException('remaining_vehicles must be between 0 and no_vehicles');
        }
        patch.remaining_vehicles = dto.remaining_vehicles;
      }

      if (dto.status !== undefined) {
        patch.status = dto.status;
      }
    }

    // ✅ Association users can only update remaining_vehicles or mark as Fulfilled
    if (isAssociation) {
      if (dto.remaining_vehicles !== undefined) {
        if (dto.remaining_vehicles < 0 || dto.remaining_vehicles > existing.no_vehicles) {
          throw new BadRequestException('remaining_vehicles must be between 0 and no_vehicles');
        }
        patch.remaining_vehicles = dto.remaining_vehicles;
      }

      if (dto.status !== undefined) {
        if (dto.status !== RouteQuotaStatus.Fulfilled) {
          throw new ForbiddenException('Association can only mark quota as Fulfilled');
        }
        patch.status = dto.status;
      }
    }

    // ✅ Overlap check for Admin only (since association cannot change dates)
    if (isAdmin) {
      await this.ensureNoOverlap(
        existing.association_id,
        existing.route_id,
        patch.start_date ?? existing.start_date,
        patch.end_date ?? existing.end_date,
        id,
      );
    }

    // ------------------------------
    // 3️⃣ Save
    // ------------------------------
    return this.quotas.update(id, patch);
  }



  // ========== helpers ==========
  private parseGc(input: string | Date, field: string): Date {
    const d = input instanceof Date ? input : new Date(input as any);
    if (isNaN(d.getTime())) throw new BadRequestException(`${field} must be a valid GC date`);
    return d;
  }

  private async countActivePairs(association_id: number): Promise<number> {
    return this.prisma.vehicle.count({
      where: {
        association_id,
        status: VehicleStatus.ACTIVE,
        driver_id: { not: null },
      },
    });
  }

  private async ensureCapacity(association_id: number, requestedNoVehicles: number) {
    const activePairs = await this.countActivePairs(association_id);
    if (requestedNoVehicles > activePairs) {
      throw new BadRequestException('no_vehicles cannot exceed active driver-vehicle pairs');
    }
  }

  private async ensureNoOverlap(
    association_id: number,
    route_id: number,
    start: Date,
    end: Date,
    excludeId?: number,
  ) {
    const overlapping = await this.prisma.routeQuota.findFirst({
      where: {
        association_id,
        route_id,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        NOT: [{ end_date: { lt: start } }, { start_date: { gt: end } }],
      },
    });
    if (overlapping) {
      throw new BadRequestException(
        'Quota window overlaps an existing quota for this route and association',
      );
    }
  }

  async remove(ctx: UserContext, id: number) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const existing = await this.quotas.findById(id);
    if (!existing) throw new NotFoundException('Route quota not found');

    const approvedCount = await this.prisma.routeAssignment.count({
      where: { route_quota_id: id, status: 'Approved' },
    });
    if (approvedCount > 0) {
      throw new ForbiddenException('Cannot delete quota with approved assignments');
    }

    return this.quotas.remove(id);
  }
}
