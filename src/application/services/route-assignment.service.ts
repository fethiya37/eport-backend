import { Inject, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ROUTE_ASSIGNMENT_REPOSITORY, RouteAssignmentUpsertRow } from '../../domain/repositories/route-assignment.repository';
import { BulkUpsertAssignmentsDto } from '../../presentation/route-assignment/dto/bulk-upsert.dto';
import { ApproveAssignmentsDto } from '../../presentation/route-assignment/dto/approve.dto';
import { etDateToGregorian } from '../../common/utils/ethio-date.util';
import { isAdminLike } from '../../common/auth/roles.util';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserContext } from 'src/common/context/user-context';
import { RouteAssignmentStatus } from '@prisma/client';
import type { IRouteAssignmentRepository } from '../../domain/repositories/route-assignment.repository';


@Injectable()
export class RouteAssignmentService {
  constructor(
    @Inject(ROUTE_ASSIGNMENT_REPOSITORY) private readonly repo: IRouteAssignmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  // Associations: can create PENDING only and only if quota exists & capacity allows
  // Admin/Superadmin: can create Approved or Pending; quota check skipped
  async bulkUpsert(ctx: UserContext, dto: BulkUpsertAssignmentsDto) {
    const association_id = isAdminLike(ctx.user_type)
      ? (dto.association_id ?? ctx.association_id ?? null)
      : (ctx.association_id ?? null);
    if (!association_id) throw new BadRequestException('association_id is required');

    // Validate each item; also ensure driver-vehicle pair is currently active in that association
    const rows: RouteAssignmentUpsertRow[] = [];
    for (const item of dto.items) {
      const start_date = etDateToGregorian(item.start_date);
      const end_date = etDateToGregorian(item.end_date);
      if (start_date > end_date) throw new BadRequestException('start_date must be <= end_date');

      // Validate entities & active pair
      const [route, driver, vehicle, activePair] = await Promise.all([
        this.prisma.route.findUnique({ where: { id: item.route_id } }),
        this.prisma.driver.findUnique({ where: { id: item.driver_id } }),
        this.prisma.vehicle.findUnique({ where: { id: item.vehicle_id } }),
        this.prisma.vehicleAssignment.findFirst({
          where: {
            association_id,
            driver_id: item.driver_id,
            vehicle_id: item.vehicle_id,
            active: true,
          },
        }),
      ]);
      if (!route) throw new BadRequestException(`Route ${item.route_id} not found`);
      if (!driver || driver.association_id !== association_id) throw new BadRequestException(`Driver ${item.driver_id} not in association`);
      if (!vehicle || vehicle.association_id !== association_id) throw new BadRequestException(`Vehicle ${item.vehicle_id} not in association`);
      if (!activePair) throw new BadRequestException(`Driver ${item.driver_id} is not actively assigned to Vehicle ${item.vehicle_id}`);

      // Determine status
      let status: RouteAssignmentStatus = RouteAssignmentStatus.Pending;
      if (isAdminLike(ctx.user_type)) {
        status = item.status === 'Approved' ? RouteAssignmentStatus.Approved : RouteAssignmentStatus.Pending;
      } else {
        await this.ensureQuotaCapacity(association_id, item.route_id, start_date, end_date);
      }

      rows.push({
        id: item.id,
        route_id: item.route_id,
        driver_id: item.driver_id,
        vehicle_id: item.vehicle_id,
        association_id,
        start_date,
        end_date,
        is_weekly: item.is_weekly,
        status,
      });
    }

    return this.repo.upsertMany(rows);
  }

  // Admin/Superadmin approval
  async approve(ctx: UserContext, dto: ApproveAssignmentsDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');
    const count = await this.repo.approveMany(dto.ids);
    return { approved: count };
  }

  // ---- helpers ----
  private async ensureQuotaCapacity(association_id: number, route_id: number, start: Date, end: Date) {
    // find any quota covering [start, end] window
    const quota = await this.prisma.routeQuota.findFirst({
      where: {
        association_id,
        route_id,
        start_date: { lte: start },
        end_date: { gte: end },
      },
    });
    if (!quota) throw new BadRequestException('No quota assigned for this route and period');

    // count assignments (Pending + Approved) overlapping the quota window
    const count = await this.prisma.routeAssignment.count({
      where: {
        association_id,
        route_id,
        // overlap condition with quota window
        NOT: [
          { end_date: { lt: quota.start_date } },
          { start_date: { gt: quota.end_date } },
        ],
      },
    });
    if (count >= quota.no_vehicles) {
      throw new BadRequestException('Quota capacity exceeded for this route and period');
    }
  }
}
