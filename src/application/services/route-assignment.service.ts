import {
  Inject,
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ROUTE_ASSIGNMENT_REPOSITORY,
  type IRouteAssignmentRepository,
  type RouteAssignmentUpsertRow,
} from '../../domain/repositories/route-assignment.repository';
import {
  VEHICLE_ASSIGNMENT_REPOSITORY,
  type IVehicleAssignmentRepository,
} from '../../domain/repositories/vehicle-assignment.repository';

import { BulkUpsertAssignmentsDto } from '../../presentation/route-assignment/dto/bulk-upsert.dto';
import { ApproveAssignmentsDto } from '../../presentation/route-assignment/dto/approve.dto';
import { UpdateAssignmentDto } from '../../presentation/route-assignment/dto/update-assignment.dto';
import { RouteAssignmentFilterDto } from '../../presentation/route-assignment/dto/find-filter.dto';

import {
  etDateToGregorian,
  etMonthStartFromGregorian,
} from '../../common/utils/ethio-date.util';
import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';
import { RouteAssignmentStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class RouteAssignmentService {
  constructor(
    @Inject(ROUTE_ASSIGNMENT_REPOSITORY)
    private readonly repo: IRouteAssignmentRepository,
    @Inject(VEHICLE_ASSIGNMENT_REPOSITORY)
    private readonly vehAssign: IVehicleAssignmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ===== helpers (dates) =====
  private startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  private endOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }
  private startOfWeekMonday(d: Date) {
    const dt = this.startOfDay(d);
    const day = dt.getDay(); // 0=Sun,1=Mon,...6=Sat
    const diff = day === 0 ? -6 : 1 - day; // move back to Monday
    dt.setDate(dt.getDate() + diff);
    return dt;
  }

  // -------- CREATE/UPDATE many --------
  async bulkUpsert(ctx: UserContext, dto: BulkUpsertAssignmentsDto) {
    const association_id = isAdminLike(ctx.user_type)
      ? (dto.association_id ?? ctx.association_id ?? null)
      : ctx.association_id ?? null;

    if (!association_id) throw new BadRequestException('association_id is required');

    const now = new Date();
    const rows: RouteAssignmentUpsertRow[] = [];

    for (const item of dto.items) {
      const start_date = etDateToGregorian(item.start_date);
      const end_date = etDateToGregorian(item.end_date);
      if (start_date > end_date) {
        throw new BadRequestException('start_date must be <= end_date');
      }

      // foreign/checks via repos
      if (!(await this.repo.existsRoute(item.route_id))) {
        throw new BadRequestException(`Route ${item.route_id} not found`);
      }
      if (!(await this.repo.existsDriverInAssociation(item.driver_id, association_id))) {
        throw new BadRequestException(`Driver ${item.driver_id} not in association`);
      }
      if (!(await this.repo.existsVehicleInAssociation(item.vehicle_id, association_id))) {
        throw new BadRequestException(`Vehicle ${item.vehicle_id} not in association`);
      }

      // active driver-vehicle pair?
      const activePair = await this.vehAssign.isActivePair(
        association_id,
        item.driver_id,
        item.vehicle_id,
      );
      if (!activePair) {
        throw new BadRequestException(
          `Driver ${item.driver_id} is not actively assigned to Vehicle ${item.vehicle_id}`,
        );
      }

      // no driver overlap in window (exclude self on update)
      const overlap = await this.repo.existsDriverOverlap(
        association_id,
        item.driver_id,
        start_date,
        end_date,
        item.id,
      );
      if (overlap) {
        throw new BadRequestException(
          `Driver ${item.driver_id} already has an assignment overlapping that period`,
        );
      }

      // status/quota
      let status: RouteAssignmentStatus;
      let route_quota_id: number | null | undefined = item.route_quota_id ?? null;
      let approved_by_user_id: number | null | undefined = null;
      let approved_at: Date | null | undefined = null;

      if (isAdminLike(ctx.user_type)) {
        // Admin: default Approved (or explicitly Approved)
        status = RouteAssignmentStatus.Approved;
        approved_by_user_id = ctx.userId;
        approved_at = now;

        // If UI passed a quota_id, validate it (association/route/window). Capacity not enforced for Admins.
        if (route_quota_id) {
          const quota = await this.repo.getQuotaById(route_quota_id);
          if (!quota) throw new BadRequestException('route_quota_id not found');
          if (quota.association_id !== association_id) throw new ForbiddenException('route_quota_id not in target association');
          if (quota.route_id !== item.route_id) throw new BadRequestException('route_quota_id does not match route_id');
          if (!(quota.start_date <= start_date && quota.end_date >= end_date)) {
            throw new BadRequestException('Assignment window not covered by the provided quota');
          }
        }
      } else {
        // Association: must have covering quota and respect capacity; force Pending
        const quota = route_quota_id
          ? await this.repo.getQuotaById(route_quota_id)
          : await this.repo.findCoveringQuota(association_id, item.route_id, start_date, end_date);

        if (!quota) throw new BadRequestException('No quota assigned for this route and period');

        if (quota.association_id !== association_id) throw new ForbiddenException('route_quota_id not in your association');
        if (quota.route_id !== item.route_id) throw new BadRequestException('route_quota_id does not match route_id');
        if (!(quota.start_date <= start_date && quota.end_date >= end_date)) {
          throw new BadRequestException('Assignment window not covered by the provided quota');
        }

        const used = await this.repo.countAssignmentsOverlappingForQuota(
          quota.id, association_id, item.route_id, start_date, end_date, item.id,
        );
        if (used >= quota.no_vehicles) {
          throw new BadRequestException('Quota capacity exceeded for this route and period');
        }

        status = RouteAssignmentStatus.Pending;
        route_quota_id = quota.id;
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
        assigned_by_user_id: ctx.userId,
        approved_by_user_id,
        approved_at,
        route_quota_id,
      });
    }

    const saved = await this.repo.upsertMany(rows);

    // keep drivers' "today" status accurate (ON_TRIP/AVAILABLE)
    await this.refreshDriversTodayStatus(association_id, saved.map((s) => s.driver_id));

    return saved;
  }

  // -------- APPROVE --------
  async approve(ctx: UserContext, dto: ApproveAssignmentsDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const updated = await this.repo.approveMany(dto.ids, ctx.userId);

    // Refresh statuses for involved drivers
    const affected = await this.repo.findByIds(dto.ids);
    const assocId = affected.length ? affected[0].association_id : undefined;
    if (assocId) {
      await this.refreshDriversTodayStatus(assocId, affected.map((a) => a.driver_id));
    }

    return { approved: updated };
  }

  // -------- FIND (generic list) --------
  async find(ctx: UserContext, filter: RouteAssignmentFilterDto) {
    const f = { ...filter };
    if (!isAdminLike(ctx.user_type) && ctx.association_id) {
      f.association_id = ctx.association_id;
    }

    const date_from = f.date_from ? etDateToGregorian(f.date_from) : undefined;
    const date_to = f.date_to ? etDateToGregorian(f.date_to) : undefined;

    return this.repo.find({
      association_id: f.association_id,
      route_id: f.route_id,
      status: f.status,
      is_weekly: typeof f.is_weekly === 'boolean' ? f.is_weekly : undefined,
      date_from,
      date_to,
      driver_id: f.driver_id,
      vehicle_id: f.vehicle_id,
    });
  }

  // -------- UPDATE one --------
  async updateOne(ctx: UserContext, id: number, dto: UpdateAssignmentDto) {
    const existing = (await this.repo.findByIds([id]))[0];
    if (!existing) throw new NotFoundException('Assignment not found');

    // association scoping + rule: assoc users cannot update Approved assignments
    if (!isAdminLike(ctx.user_type)) {
      if (!ctx.association_id || existing.association_id !== ctx.association_id) {
        throw new ForbiddenException('Not in your association');
      }
      if (existing.status === 'Approved') {
        throw new ForbiddenException('Association users cannot update approved assignments');
      }
    }

    const association_id = existing.association_id;
    const route_id = dto.route_id ?? existing.route_id;
    const driver_id = dto.driver_id ?? existing.driver_id;
    const vehicle_id = dto.vehicle_id ?? existing.vehicle_id;
    const start_date = dto.start_date
      ? etDateToGregorian(dto.start_date)
      : existing.start_date;
    const end_date = dto.end_date ? etDateToGregorian(dto.end_date) : existing.end_date;

    if (start_date > end_date) throw new BadRequestException('start_date must be <= end_date');

    // foreigns
    if (!(await this.repo.existsRoute(route_id))) throw new BadRequestException('Route not found');
    if (!(await this.repo.existsDriverInAssociation(driver_id, association_id)))
      throw new BadRequestException('Driver not in association');
    if (!(await this.repo.existsVehicleInAssociation(vehicle_id, association_id)))
      throw new BadRequestException('Vehicle not in association');

    // active pair?
    if (!(await this.vehAssign.isActivePair(association_id, driver_id, vehicle_id))) {
      throw new BadRequestException('Driver is not actively assigned to this vehicle');
    }

    // overlap (exclude self)
    if (await this.repo.existsDriverOverlap(association_id, driver_id, start_date, end_date, id)) {
      throw new BadRequestException('Driver already has an assignment overlapping that period');
    }

    // status/quota logic
    let status: RouteAssignmentStatus = existing.status as RouteAssignmentStatus;
    let approved_by_user_id: number | null | undefined = existing.approved_by_user_id ?? null;
    let approved_at: Date | null | undefined = existing.approved_at ?? null;
    let route_quota_id: number | null | undefined = existing.route_quota_id ?? null;

    if (isAdminLike(ctx.user_type)) {
      if (dto.status === 'Approved') {
        status = RouteAssignmentStatus.Approved;
        approved_by_user_id = ctx.userId;
        approved_at = new Date();
      } else if (dto.status === 'Pending') {
        status = RouteAssignmentStatus.Pending;
        approved_by_user_id = null;
        approved_at = null;
      }
      if (dto.route_quota_id !== undefined) route_quota_id = dto.route_quota_id;
    } else {
      // Association: must be Pending and linked to a covering quota with capacity
      const quota = await this.repo.findCoveringQuota(association_id, route_id, start_date, end_date);
      if (!quota) throw new BadRequestException('No quota assigned for this route and period');

      const used = await this.repo.countAssignmentsOverlappingForQuota(
        quota.id,
        association_id,
        route_id,
        start_date,
        end_date,
        id,
      );
      if (used >= quota.no_vehicles) throw new BadRequestException('Quota capacity exceeded');

      status = RouteAssignmentStatus.Pending;
      route_quota_id = quota.id;
      approved_by_user_id = null;
      approved_at = null;
    }

    const [saved] = await this.repo.upsertMany([
      {
        id,
        route_id,
        driver_id,
        vehicle_id,
        association_id,
        start_date,
        end_date,
        is_weekly: dto.is_weekly ?? existing.is_weekly,
        status,
        assigned_by_user_id: existing.assigned_by_user_id,
        approved_by_user_id,
        approved_at,
        route_quota_id,
      },
    ]);

    await this.refreshDriversTodayStatus(association_id, [driver_id]);

    return saved;
  }

  // -------- Visible coverage (current→active_until) --------
  /**
   * Visible coverage for drivers/owners/admins:
   * - Resolve a target driver (by driver_id or by active pair found via plate_number).
   * - Show ONLY Approved assignments within: [currentPeriodStart(today) .. active_until_date],
   *   but ONLY if the driver coverage is active (today <= active_until_date).
   * - No gating when assigning routes (this is viewing only).
   */
  async visibleCoverage(
    ctx: UserContext,
    q: { driver_id?: number; plate_number?: string }
  ) {
    if (!q.driver_id && !q.plate_number) {
      throw new BadRequestException('Provide driver_id or plate_number');
    }

    // Resolve driver by id or plate_number (active pair)
    if (q.driver_id) {
      const d = await this.prisma.driver.findUnique({
        where: { id: q.driver_id },
        select: {
          id: true, association_id: true, is_weekly: true,
          active_until_date: true,
        },
      });
      if (!d) throw new NotFoundException('Driver not found');

      if (!isAdminLike(ctx.user_type) && ctx.association_id && ctx.association_id !== d.association_id) {
        throw new ForbiddenException('Not in your association');
      }

      const today = this.startOfDay(new Date());
      if (!d.active_until_date || this.startOfDay(d.active_until_date) < today) {
        return []; // no active coverage
      }

      const from = d.is_weekly ? this.startOfWeekMonday(today) : etMonthStartFromGregorian(today);
      const to = this.endOfDay(d.active_until_date);
      return this.repo.find({
        association_id: d.association_id,
        driver_id: d.id,
        status: RouteAssignmentStatus.Approved,
        date_from: from,
        date_to: to,
      });
    }

    // plate_number path
    const v = await this.prisma.vehicle.findUnique({
      where: { plate_number: q.plate_number! },
      select: { id: true, association_id: true },
    });
    if (!v) throw new NotFoundException('Vehicle not found');

    const activePair = await this.prisma.vehicleAssignment.findFirst({
      where: { vehicle_id: v.id, association_id: v.association_id, active: true },
      select: { driver_id: true },
    });
    if (!activePair) return [];

    const d = await this.prisma.driver.findUnique({
      where: { id: activePair.driver_id },
      select: {
        id: true, association_id: true, is_weekly: true,
        active_until_date: true,
      },
    });
    if (!d) throw new NotFoundException('Driver not found');

    if (!isAdminLike(ctx.user_type) && ctx.association_id && ctx.association_id !== d.association_id) {
      throw new ForbiddenException('Not in your association');
    }

    const today = this.startOfDay(new Date());
    if (!d.active_until_date || this.startOfDay(d.active_until_date) < today) {
      return [];
    }

    const from = d.is_weekly ? this.startOfWeekMonday(today) : etMonthStartFromGregorian(today);
    const to = this.endOfDay(d.active_until_date);
    return this.repo.find({
      association_id: d.association_id,
      driver_id: d.id,
      status: RouteAssignmentStatus.Approved,
      date_from: from,
      date_to: to,
    });
  }

  // -------- helpers --------
  private async refreshDriversTodayStatus(association_id: number, driverIds: number[]) {
    if (!driverIds.length) return;
    const today = new Date();
    const unique = Array.from(new Set(driverIds));
    for (const driver_id of unique) {
      const onTrip = await this.repo.hasApprovedOnDate(association_id, driver_id, today);
      await this.repo.setDriverStatus(driver_id, onTrip ? 'ON_TRIP' : 'AVAILABLE');
    }
  }
}
