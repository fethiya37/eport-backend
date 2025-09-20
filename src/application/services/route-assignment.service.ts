// src/application/services/route-assignment.service.ts
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

import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';
import { RouteAssignmentStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { BulkUpsertAssignmentsDto } from '../../presentation/route-assignment/dto/bulk-upsert.dto';
import { ApproveAssignmentsDto } from '../../presentation/route-assignment/dto/approve.dto';
import { UpdateAssignmentDto } from '../../presentation/route-assignment/dto/update-assignment.dto';
import { RouteAssignmentFilterDto } from '../../presentation/route-assignment/dto/find-filter.dto';

// GC/EC helpers (only used for visible window; NOT for payload conversion)
import {
  startOfDay,
  endOfDay,
  startOfWeekMonday,
  etMonthStart,
} from '../../common/utils/ethio-period.util';

@Injectable()
export class RouteAssignmentService {
  constructor(
    @Inject(ROUTE_ASSIGNMENT_REPOSITORY)
    private readonly repo: IRouteAssignmentRepository,
    @Inject(VEHICLE_ASSIGNMENT_REPOSITORY)
    private readonly vehAssign: IVehicleAssignmentRepository,
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Parse a GC date coming from the client.
   * - If ISO string is provided, we normalize to local 00:00 for comparisons.
   * - If 'YYYY-MM-DD' is provided, we construct local 00:00 of that GC date.
   * NO EC→GC conversion anywhere.
   */
  private parseGcDate(d: string | Date): Date {
    if (d instanceof Date) return d;
    const s = d.trim();

    // Plain YYYY-MM-DD
    if (!s.includes('T')) {
      const [y, m, dd] = s.split('-').map((x) => parseInt(x, 10));
      const out = new Date(Date.UTC(y, m - 1, dd)); // treat as UTC
      if (isNaN(out.getTime()))
        throw new BadRequestException('Invalid GC date');
      console.log('Parsed GC date (UTC):', out.toISOString());
      return out;
    }

    // ISO string: keep as UTC, but remove startOfDay shifting
    const iso = new Date(s);
    if (isNaN(iso.getTime())) throw new BadRequestException('Invalid GC date');
    return iso;
  }

  // --------------------------------------------------------------------------
  // CREATE/UPDATE many (GC only; expects GC from client)
  // --------------------------------------------------------------------------
  async bulkUpsert(ctx: UserContext, dto: BulkUpsertAssignmentsDto) {
    const association_id = isAdminLike(ctx.user_type)
      ? dto.association_id ?? ctx.association_id ?? null
      : ctx.association_id ?? null;
    if (!association_id) throw new BadRequestException('association_id is required');

    const now = new Date();
    const rows: RouteAssignmentUpsertRow[] = [];

    for (const it of dto.items) {
      const start_date = this.parseGcDate(it.start_date as any);
      const end_date = this.parseGcDate(it.end_date as any);

      if (start_date > end_date) throw new BadRequestException('start_date must be <= end_date');

      if (!(await this.repo.existsRoute(it.route_id))) {
        throw new BadRequestException(`Route ${it.route_id} not found`);
      }
      if (!(await this.repo.existsDriverInAssociation(it.driver_id, association_id))) {
        throw new BadRequestException(`Driver ${it.driver_id} not in association`);
      }
      if (!(await this.repo.existsVehicleInAssociation(it.vehicle_id, association_id))) {
        throw new BadRequestException(`Vehicle ${it.vehicle_id} not in association`);
      }

      // Must be the currently active driver–vehicle pair
      const activePair = await this.vehAssign.isActivePair(
        association_id,
        it.driver_id,
        it.vehicle_id,
      );
      if (!activePair) {
        throw new BadRequestException(
          `Driver ${it.driver_id} is not actively assigned to Vehicle ${it.vehicle_id}`,
        );
      }

      // Prevent overlaps for the same driver
      const overlaps = await this.repo.existsDriverOverlap(
        association_id,
        it.driver_id,
        start_date,
        end_date,
        it.id,
      );
      if (overlaps) {
        throw new BadRequestException(
          `Driver ${it.driver_id} already has an assignment overlapping that period`,
        );
      }

      // Quota & status resolution
      let status: RouteAssignmentStatus;
      let route_quota_id: number | null | undefined = it.route_quota_id ?? null;
      let approved_by_user_id: number | null | undefined = null;
      let approved_at: Date | null | undefined = null;

      if (isAdminLike(ctx.user_type)) {
        status = RouteAssignmentStatus.Approved;
        approved_by_user_id = ctx.userId;
        approved_at = now;

        if (route_quota_id) {
          const q = await this.repo.getQuotaById(route_quota_id);
          if (!q) throw new BadRequestException('route_quota_id not found');
          if (q.association_id !== association_id) throw new ForbiddenException('route_quota_id not in target association');
          if (q.route_id !== it.route_id) throw new BadRequestException('route_quota_id does not match route_id');
          if (!(q.start_date <= start_date && q.end_date >= end_date)) {
            throw new BadRequestException('Assignment window not covered by quota');
          }
        }
      } else {
        const q = route_quota_id
          ? await this.repo.getQuotaById(route_quota_id)
          : await this.repo.findCoveringQuota(association_id, it.route_id, start_date, end_date);
        if (!q) throw new BadRequestException('No quota for this route and period');
        if (q.association_id !== association_id) throw new ForbiddenException('route_quota_id not in your association');
        if (q.route_id !== it.route_id) throw new BadRequestException('route_quota_id does not match route_id');
        if (!(q.start_date <= start_date && q.end_date >= end_date)) {
          throw new BadRequestException('Assignment window not covered by quota');
        }

        const used = await this.repo.countAssignmentsOverlappingForQuota(
          q.id,
          association_id,
          it.route_id,
          start_date,
          end_date,
          it.id,
        );
        if (used >= q.no_vehicles) throw new BadRequestException('Quota capacity exceeded');

        status = RouteAssignmentStatus.Pending;
        route_quota_id = q.id;
      }

      rows.push({
        id: it.id,
        route_id: it.route_id,
        driver_id: it.driver_id,
        vehicle_id: it.vehicle_id,
        association_id,
        start_date,
        end_date,
        is_weekly: it.is_weekly,
        status,
        assigned_by_user_id: ctx.userId,
        approved_by_user_id,
        approved_at,
        route_quota_id,
      });
    }

    const saved = await this.repo.upsertMany(rows);
    await this.refreshDriversTodayStatus(
      association_id,
      saved.map((s) => s.driver_id),
    );
    return saved;
  }

  // --------------------------------------------------------------------------
  // APPROVE
  // --------------------------------------------------------------------------
  async approve(ctx: UserContext, dto: ApproveAssignmentsDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');

    const updated = await this.repo.approveMany(dto.ids, ctx.userId);
    const affected = await this.repo.findByIds(dto.ids);
    const assocId = affected.length ? affected[0].association_id : undefined;

    if (assocId) {
      await this.refreshDriversTodayStatus(
        assocId,
        affected.map((a) => a.driver_id),
      );
    }
    return { approved: updated };
  }

  // --------------------------------------------------------------------------
  // FIND (GC filter passthrough; expects GC from client)
  // --------------------------------------------------------------------------
  async find(ctx: UserContext, filter: RouteAssignmentFilterDto) {
    const f = { ...filter };
    if (!isAdminLike(ctx.user_type) && ctx.association_id) {
      f.association_id = ctx.association_id;
    }

    const date_from = f.date_from ? this.parseGcDate(f.date_from as any) : undefined;
    const date_to = f.date_to ? this.parseGcDate(f.date_to as any) : undefined;

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

  // --------------------------------------------------------------------------
  // UPDATE ONE (GC only; expects GC from client)
  // --------------------------------------------------------------------------
  async updateOne(ctx: UserContext, id: number, dto: UpdateAssignmentDto) {
    const existing = (await this.repo.findByIds([id]))[0];
    if (!existing) throw new NotFoundException('Assignment not found');

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

    const start_date = dto.start_date ? this.parseGcDate(dto.start_date as any) : existing.start_date;
    const end_date = dto.end_date ? this.parseGcDate(dto.end_date as any) : existing.end_date;

    if (start_date > end_date) throw new BadRequestException('start_date must be <= end_date');

    if (!(await this.repo.existsRoute(route_id))) throw new BadRequestException('Route not found');
    if (!(await this.repo.existsDriverInAssociation(driver_id, association_id))) {
      throw new BadRequestException('Driver not in association');
    }
    if (!(await this.repo.existsVehicleInAssociation(vehicle_id, association_id))) {
      throw new BadRequestException('Vehicle not in association');
    }

    if (!(await this.vehAssign.isActivePair(association_id, driver_id, vehicle_id))) {
      throw new BadRequestException('Driver is not actively assigned to this vehicle');
    }

    const overlaps = await this.repo.existsDriverOverlap(
      association_id,
      driver_id,
      start_date,
      end_date,
      id,
    );
    if (overlaps) throw new BadRequestException('Driver already has an assignment overlapping that period');

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
      const q = await this.repo.findCoveringQuota(association_id, route_id, start_date, end_date);
      if (!q) throw new BadRequestException('No quota assigned for this route and period');

      const used = await this.repo.countAssignmentsOverlappingForQuota(
        q.id,
        association_id,
        route_id,
        start_date,
        end_date,
        id,
      );
      if (used >= q.no_vehicles) throw new BadRequestException('Quota capacity exceeded');

      status = RouteAssignmentStatus.Pending;
      route_quota_id = q.id;
      approved_by_user_id = null;
      approved_at = null;
    }

    const [saved] = await this.repo.upsertMany([{
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
    }]);

    await this.refreshDriversTodayStatus(association_id, [driver_id]);
    return saved;
  }

  // --------------------------------------------------------------------------
  // Visible coverage by plate_number (no EC→GC conversion of payloads)
  // Window = current period start (weekly Monday / monthly EC month start based on "today" GC)
  // --------------------------------------------------------------------------
  async visibleCoverage(ctx: UserContext, plate_number: string) {
    if (!plate_number) throw new BadRequestException('plate_number is required');

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { plate_number },
      select: { id: true, association_id: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const active = await this.prisma.vehicleAssignment.findFirst({
      where: { vehicle_id: vehicle.id, association_id: vehicle.association_id, active: true },
      select: { driver_id: true },
    });
    if (!active) throw new BadRequestException('No active driver–vehicle assignment for this plate_number');

    const driver = await this.prisma.driver.findUnique({
      where: { id: active.driver_id },
      select: {
        id: true,
        association_id: true,
        is_weekly: true,
        active_until_date: true,
        full_name: true,
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    if (!isAdminLike(ctx.user_type) && ctx.association_id && ctx.association_id !== driver.association_id) {
      throw new ForbiddenException('Not in your association');
    }

    const assoc = await this.prisma.association.findUnique({
      where: { id: driver.association_id },
      select: { id: true, name: true },
    });

    const today = startOfDay(new Date());
    if (!driver.active_until_date || startOfDay(driver.active_until_date) < today) {
      return {
        driver_id: driver.id,
        driver_name: driver.full_name ?? null,
        association_id: assoc?.id ?? null,
        association_name: assoc?.name ?? null,
        plate_number,
        coverage_active: false,
        window: null,
        assignments: [],
      };
    }

    // Window start depends on plan (weekly Monday or EC month start) — derived from GC “today”
    const windowStart = driver.is_weekly ? startOfWeekMonday(today) : etMonthStart(today);
    const windowEnd = endOfDay(driver.active_until_date);

    const rows = await this.prisma.routeAssignment.findMany({
      where: {
        driver_id: driver.id,
        association_id: driver.association_id,
        status: { in: [RouteAssignmentStatus.Pending, RouteAssignmentStatus.Approved] },
        NOT: [
          { end_date: { lt: windowStart } }, // ends before window
          { start_date: { gt: windowEnd } }, // starts after window
        ],
      },
      include: {
        route: { select: { id: true, departure: true, arrival: true } },
        vehicle: { select: { plate_number: true } },
      },
      orderBy: { start_date: 'asc' },
    });

    return {
      driver_id: driver.id,
      driver_name: driver.full_name ?? null,
      association_id: assoc?.id ?? null,
      association_name: assoc?.name ?? null,
      plate_number,
      coverage_active: true,
      window: {
        from: windowStart.toISOString(),
        to: windowEnd.toISOString(),
        is_weekly: driver.is_weekly,
      },
      assignments: rows.map((r) => ({
        id: r.id,
        status: r.status,
        start_date: r.start_date.toISOString(),
        end_date: r.end_date.toISOString(),
        is_weekly: r.is_weekly,
        vehicle_plate: r.vehicle?.plate_number ?? null,
        route: {
          id: r.route.id,
          departure: r.route.departure,
          arrival: r.route.arrival,
        },
      })),
    };
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
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
