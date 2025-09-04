import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IRouteAssignmentRepository,
  RouteAssignmentFindFilter,
  RouteAssignmentUpsertRow,
} from '../../domain/repositories/route-assignment.repository';
import { Prisma, RouteAssignment, RouteAssignmentStatus, RouteQuota, DriverStatus } from '@prisma/client';

@Injectable()
export class PrismaRouteAssignmentRepository implements IRouteAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMany(data: RouteAssignmentUpsertRow[]): Promise<RouteAssignment[]> {
    return this.prisma.$transaction(async (tx) => {
      const results: RouteAssignment[] = [];
      for (const row of data) {
        if (row.id) {
          const updated = await tx.routeAssignment.update({
            where: { id: row.id },
            data: {
              route_id: row.route_id,
              driver_id: row.driver_id,
              vehicle_id: row.vehicle_id,
              association_id: row.association_id,
              start_date: row.start_date,
              end_date: row.end_date,
              is_weekly: row.is_weekly,
              status: row.status,
              assigned_by_user_id: row.assigned_by_user_id,
              approved_by_user_id: row.approved_by_user_id ?? null,
              approved_at: row.approved_at ?? null,
              route_quota_id: row.route_quota_id ?? null,
            },
          });
          results.push(updated);
        } else {
          const created = await tx.routeAssignment.create({
            data: {
              route_id: row.route_id,
              driver_id: row.driver_id,
              vehicle_id: row.vehicle_id,
              association_id: row.association_id,
              start_date: row.start_date,
              end_date: row.end_date,
              is_weekly: row.is_weekly,
              status: row.status,
              assigned_by_user_id: row.assigned_by_user_id,
              approved_by_user_id: row.approved_by_user_id ?? null,
              approved_at: row.approved_at ?? null,
              route_quota_id: row.route_quota_id ?? null,
            },
          });
          results.push(created);
        }
      }
      return results;
    });
  }

  approveMany(ids: number[], approver_user_id: number): Promise<number> {
    return this.prisma.routeAssignment
      .updateMany({
        where: { id: { in: ids } },
        data: {
          status: RouteAssignmentStatus.Approved,
          approved_by_user_id: approver_user_id,
          approved_at: new Date(),
        },
      })
      .then((r) => r.count);
  }

  find(filter: RouteAssignmentFindFilter): Promise<RouteAssignment[]> {
    const where: Prisma.RouteAssignmentWhereInput = {
      ...(filter.association_id ? { association_id: filter.association_id } : {}),
      ...(filter.route_id ? { route_id: filter.route_id } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(typeof filter.is_weekly === 'boolean' ? { is_weekly: filter.is_weekly } : {}),
      ...(filter.driver_id ? { driver_id: filter.driver_id } : {}),
      ...(filter.vehicle_id ? { vehicle_id: filter.vehicle_id } : {}),
      ...(filter.date_from || filter.date_to
        ? {
            NOT: {
              OR: [
                ...(filter.date_from ? [{ end_date: { lt: filter.date_from } }] : []),
                ...(filter.date_to ? [{ start_date: { gt: filter.date_to } }] : []),
              ],
            },
          }
        : {}),
    };
    return this.prisma.routeAssignment.findMany({ where, orderBy: { id: 'desc' } });
  }

  findByIds(ids: number[]): Promise<RouteAssignment[]> {
    if (!ids.length) return Promise.resolve([]);
    return this.prisma.routeAssignment.findMany({ where: { id: { in: ids } } });
  }

  // ---- validations / helpers ----
  async existsRoute(route_id: number): Promise<boolean> {
    return !!(await this.prisma.route.findUnique({ where: { id: route_id } }));
  }

  async existsDriverInAssociation(driver_id: number, association_id: number): Promise<boolean> {
    const d = await this.prisma.driver.findUnique({ where: { id: driver_id } });
    return !!d && d.association_id === association_id;
  }

  async existsVehicleInAssociation(vehicle_id: number, association_id: number): Promise<boolean> {
    const v = await this.prisma.vehicle.findUnique({ where: { id: vehicle_id } });
    return !!v && v.association_id === association_id;
  }

  async existsDriverOverlap(
    association_id: number,
    driver_id: number,
    start: Date,
    end: Date,
    excludeId?: number,
  ): Promise<boolean> {
    const found = await this.prisma.routeAssignment.findFirst({
      where: {
        driver_id,
        association_id,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        NOT: [{ end_date: { lt: start } }, { start_date: { gt: end } }],
      },
    });
    return !!found;
  }

  findCoveringQuota(
    association_id: number,
    route_id: number,
    start: Date,
    end: Date,
  ): Promise<RouteQuota | null> {
    return this.prisma.routeQuota.findFirst({
      where: { association_id, route_id, start_date: { lte: start }, end_date: { gte: end } },
    });
  }

  countAssignmentsOverlappingForQuota(
    quota_id: number,
    association_id: number,
    route_id: number,
    start: Date,
    end: Date,
    excludeId?: number,
  ): Promise<number> {
    return this.prisma.routeAssignment.count({
      where: {
        association_id,
        route_id,
        route_quota_id: quota_id,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        NOT: [{ end_date: { lt: start } }, { start_date: { gt: end } }],
      },
    });
  }

  getQuotaById(id: number): Promise<RouteQuota | null> {
    return this.prisma.routeQuota.findUnique({ where: { id } });
  }

  // ✅ NEW: used by RouteAssignmentService.refreshDriversTodayStatus
  async hasApprovedOnDate(association_id: number, driver_id: number, day: Date): Promise<boolean> {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const cnt = await this.prisma.routeAssignment.count({
      where: {
        association_id,
        driver_id,
        status: RouteAssignmentStatus.Approved,
        NOT: [{ end_date: { lt: start } }, { start_date: { gt: end } }],
      },
    });
    return cnt > 0;
  }

  async setDriverStatus(driver_id: number, status: 'ON_TRIP' | 'AVAILABLE'): Promise<void> {
    await this.prisma.driver.update({
      where: { id: driver_id },
      data: { status: status as DriverStatus },
    });
  }
}
