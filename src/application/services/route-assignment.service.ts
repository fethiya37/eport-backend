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
import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';
import { RouteAssignmentStatus, PaymentStatus, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BulkUpsertAssignmentsDto } from '../../presentation/route-assignment/dto/bulk-upsert.dto';
import { ApproveAssignmentsDto } from '../../presentation/route-assignment/dto/approve.dto';
import { UpdateAssignmentDto } from '../../presentation/route-assignment/dto/update-assignment.dto';
import { RouteAssignmentFilterDto } from '../../presentation/route-assignment/dto/find-filter.dto';
import {
  startOfDay,
  endOfDay,
  startOfWeekMonday,
  etMonthStart,
} from '../../common/utils/ethio-period.util';
import { gcToEthiopian } from 'src/common/utils/ethio-date.util';

@Injectable()
export class RouteAssignmentService {
  constructor(
    @Inject(ROUTE_ASSIGNMENT_REPOSITORY)
    private readonly repo: IRouteAssignmentRepository,
    private readonly prisma: PrismaService,
  ) { }

  // -----------------------------
  // Helpers
  // -----------------------------
  private parseGcDate(d: string | Date): Date {
    if (d instanceof Date) return d;
    const s = d.trim();
    if (!s.includes('T')) {
      const [y, m, dd] = s.split('-').map((x) => parseInt(x, 10));
      return new Date(Date.UTC(y, m - 1, dd));
    }
    return new Date(s);
  }

  private async existsRoute(route_id: number): Promise<boolean> {
    return !!(await this.prisma.route.findUnique({ where: { id: route_id } }));
  }

  private async existsVehicleInAssociation(
    vehicle_id: number,
    association_id: number,
  ): Promise<boolean> {
    const v = await this.prisma.vehicle.findUnique({ where: { id: vehicle_id } });
    return !!v && v.association_id === association_id;
  }

  private async existsVehicleOverlap(
    association_id: number,
    vehicle_id: number,
    start: Date,
    end: Date,
    excludeId?: number,
  ): Promise<boolean> {
    const found = await this.prisma.routeAssignment.findFirst({
      where: {
        vehicle_id,
        association_id,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        NOT: [{ end_date: { lt: start } }, { start_date: { gt: end } }],
      },
    });
    return !!found;
  }

  // -----------------------------
  // Bulk Upsert
  // -----------------------------
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

      if (!(await this.existsRoute(it.route_id)))
        throw new BadRequestException(`Route ${it.route_id} not found`);
      if (!(await this.existsVehicleInAssociation(it.vehicle_id, association_id)))
        throw new BadRequestException(`Vehicle ${it.vehicle_id} not in association`);

      const overlaps = await this.existsVehicleOverlap(
        association_id,
        it.vehicle_id,
        start_date,
        end_date,
        it.id,
      );
      if (overlaps) {
        throw new BadRequestException(`Vehicle ${it.vehicle_id} has overlapping assignment`);
      }

      // 🔑 set payment_status
      const driver = await this.prisma.driver.findFirst({
        where: { vehicle: { id: it.vehicle_id } },
        select: { active_until_date: true },
      });

      const payment_status =
        driver?.active_until_date && end_date <= driver.active_until_date
          ? PaymentStatus.ACTIVE
          : PaymentStatus.INACTIVE;

      rows.push({
        id: it.id,
        route_id: it.route_id,
        vehicle_id: it.vehicle_id,
        association_id,
        start_date,
        end_date,
        is_weekly:
          (
            await this.prisma.vehicle.findUnique({
              where: { id: it.vehicle_id },
              select: { is_weekly: true },
            })
          )?.is_weekly ?? false,
        status: isAdminLike(ctx.user_type)
          ? RouteAssignmentStatus.Approved
          : RouteAssignmentStatus.Pending,
        assigned_by_user_id: ctx.userId,
        approved_by_user_id: isAdminLike(ctx.user_type) ? ctx.userId : null,
        approved_at: isAdminLike(ctx.user_type) ? now : null,
        route_quota_id: it.route_quota_id ?? null,
        history_status: it.history_status ?? undefined,
        payment_status,
      });
    }

    return this.repo.upsertMany(rows);
  }

  // -----------------------------
  // Approve
  // -----------------------------
  async approve(ctx: UserContext, dto: ApproveAssignmentsDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');
    const updated = await this.repo.approveMany(dto.ids, ctx.userId);
    return { approved: updated };
  }

  // -----------------------------
  // Find
  // -----------------------------
  async find(ctx: UserContext, filter: RouteAssignmentFilterDto) {
    const f = { ...filter };
    if (!isAdminLike(ctx.user_type) && ctx.association_id) {
      f.association_id = ctx.association_id;
    }

    const date_from = f.date_from ? this.parseGcDate(f.date_from as any) : undefined;
    const date_to = f.date_to ? this.parseGcDate(f.date_to as any) : undefined;

    const results = await this.repo.find({
      association_id: f.association_id,
      route_id: f.route_id,
      status: f.status,
      date_from,
      date_to,
      vehicle_id: f.vehicle_id,
      payment_status: f.payment_status,
    });

    // Already typed with relations, you can return directly
    return results.map(r => ({
      id: r.id,
      start_date: r.start_date,
      end_date: r.end_date,
      status: r.status,
      payment_status: r.payment_status,
      is_weekly: r.is_weekly,
      vehicle: {
        id: r.vehicle.id,
        plate_number: r.vehicle.plate_number,
        driver: r.vehicle.driver,
      },
      route: r.route,
      assigned_by: r.assigned_by,
      approved_by: r.approved_by,
    }));
  }


  // -----------------------------
  // Update One
  // -----------------------------
  async updateOne(ctx: UserContext, id: number, dto: UpdateAssignmentDto) {
    const existing = (await this.repo.findByIds([id]))[0];
    if (!existing) throw new NotFoundException('Assignment not found');
    if (!isAdminLike(ctx.user_type) && existing.status === 'Approved') {
      throw new ForbiddenException('Association users cannot update approved assignments');
    }

    const start_date = dto.start_date ? this.parseGcDate(dto.start_date as any) : existing.start_date;
    const end_date = dto.end_date ? this.parseGcDate(dto.end_date as any) : existing.end_date;
    if (start_date > end_date) throw new BadRequestException('start_date must be <= end_date');

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicle_id ?? existing.vehicle_id },
      select: { is_weekly: true, driver_id: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const driver = vehicle.driver_id
      ? await this.prisma.driver.findUnique({
        where: { id: vehicle.driver_id },
        select: { active_until_date: true },
      })
      : null;

    const payment_status =
      driver?.active_until_date && end_date <= driver.active_until_date
        ? PaymentStatus.ACTIVE
        : PaymentStatus.INACTIVE;

    const [saved] = await this.repo.upsertMany([
      {
        id,
        route_id: dto.route_id ?? existing.route_id,
        vehicle_id: dto.vehicle_id ?? existing.vehicle_id,
        association_id: existing.association_id,
        start_date,
        end_date,
        is_weekly: vehicle.is_weekly,
        status: existing.status as RouteAssignmentStatus,
        assigned_by_user_id: existing.assigned_by_user_id,
        route_quota_id: dto.route_quota_id ?? existing.route_quota_id,
        history_status: dto.history_status ?? existing.history_status,
        payment_status,
      },
    ]);

    return saved;
  }

  // -----------------------------
  // Remove
  // -----------------------------
  async remove(ctx: UserContext, id: number) {
    const existing = (await this.repo.findByIds([id]))[0];
    if (!existing) throw new NotFoundException('Assignment not found');

    if (!isAdminLike(ctx.user_type) && existing.status === RouteAssignmentStatus.Approved) {
      throw new ForbiddenException('Association users cannot delete approved assignments');
    }

    return this.repo.remove(id);
  }

  // -----------------------------
  // Visible Coverage
  // -----------------------------
  async visibleCoverage(ctx: UserContext, q: { plate_number?: string; driver_id?: number }) {
    let vehicle: {
      id: number;
      association_id: number;
      driver_id: number | null;
      is_weekly: boolean;
      plate_number: string;
      status: VehicleStatus;
    } | null = null;

    let driver: {
      id: number;
      full_name: string;
      phone_number: string;
      active_until_date: Date | null;
      association_id: number;
      vehicle?: {
        id: number;
        association_id: number;
        is_weekly: boolean;
        plate_number: string;
        status: VehicleStatus;
      } | null;
    } | null = null;

    // --- Resolve by plate_number or driver_id
    if (q.plate_number) {
      vehicle = await this.prisma.vehicle.findUnique({
        where: { plate_number: q.plate_number },
        select: {
          id: true,
          association_id: true,
          driver_id: true,
          is_weekly: true,
          plate_number: true,
          status: true,
        },
      });
      if (!vehicle) throw new NotFoundException('Vehicle not found');
      if (!vehicle.driver_id) throw new BadRequestException('No driver assigned to this vehicle');

      driver = await this.prisma.driver.findUnique({
        where: { id: vehicle.driver_id },
        select: {
          id: true,
          full_name: true,
          phone_number: true,
          active_until_date: true,
          association_id: true,
        },
      });
    } else if (q.driver_id) {
      driver = await this.prisma.driver.findUnique({
        where: { id: q.driver_id },
        select: {
          id: true,
          full_name: true,
          phone_number: true,
          active_until_date: true,
          association_id: true,
          vehicle: {
            select: {
              id: true,
              association_id: true,
              is_weekly: true,
              plate_number: true,
              status: true,
            },
          },
        },
      });
      if (!driver) throw new NotFoundException('Driver not found');
      if (!driver.vehicle) throw new BadRequestException('No vehicle assigned to this driver');

      vehicle = {
        id: driver.vehicle.id,
        association_id: driver.vehicle.association_id,
        driver_id: driver.id,
        is_weekly: driver.vehicle.is_weekly,
        plate_number: driver.vehicle.plate_number,
        status: driver.vehicle.status,
      };
    } else {
      throw new BadRequestException('Either plate_number or driver_id is required');
    }

    if (!driver) throw new NotFoundException('Driver not found');

    // --- Check active_until_date and vehicle status
    const today = startOfDay(new Date());
    if (!driver.active_until_date || startOfDay(driver.active_until_date) < today || vehicle.status === VehicleStatus.INACTIVE) {
      return { not_full_filled: true };
    }

    // --- Window boundaries
    const windowStart = vehicle.is_weekly ? startOfWeekMonday(today) : etMonthStart(today);
    const windowEnd = endOfDay(driver.active_until_date);

    // --- Get assignments fully contained in window
    const assignments = await this.prisma.routeAssignment.findMany({
      where: {
        vehicle_id: vehicle.id,
        association_id: vehicle.association_id,
        status: { in: [RouteAssignmentStatus.Pending, RouteAssignmentStatus.Approved] },
        payment_status: PaymentStatus.ACTIVE,
        start_date: { gte: windowStart },
        end_date: { lte: windowEnd },
      },
      include: { route: true },
      orderBy: { start_date: 'asc' },
    });

    if (assignments.length === 0) {
      return {
        message: `Route assignment doesn't exist for ${windowStart.toISOString().slice(0, 10)} - ${windowEnd.toISOString().slice(0, 10)}`,
        driver_active_until: driver.active_until_date.toISOString().slice(0, 10),
      };
    }

    // --- Association name
    const association = await this.prisma.association.findUnique({
      where: { id: vehicle.association_id },
      select: { name: true },
    });

    return {
      association_name: association?.name ?? '',
      plate_number: vehicle.plate_number,
      driver_name: driver.full_name,
      driver_active_until: driver.active_until_date.toISOString().slice(0, 10),
      assignments: assignments.map((r) => ({
        route: {
          id: r.route.id,
          departure: r.route.departure,
          arrival: r.route.arrival,
        },
        start_date_gc: r.start_date.toISOString(),
        end_date_gc: r.end_date.toISOString(),
        status: r.status,
      })),
    };
  }

}
