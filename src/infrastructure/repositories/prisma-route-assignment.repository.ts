import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IRouteAssignmentRepository, RouteAssignmentUpsertRow } from '../../domain/repositories/route-assignment.repository';
import { RouteAssignment } from '@prisma/client';

@Injectable()
export class PrismaRouteAssignmentRepository implements IRouteAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMany(rows: RouteAssignmentUpsertRow[]): Promise<RouteAssignment[]> {
    const results: RouteAssignment[] = [];
    await this.prisma.$transaction(async (tx) => {
      for (const r of rows) {
        if (r.id) {
          const updated = await tx.routeAssignment.update({
            where: { id: r.id },
            data: {
              route_id: r.route_id,
              driver_id: r.driver_id,
              vehicle_id: r.vehicle_id,
              association_id: r.association_id,
              start_date: r.start_date,
              end_date: r.end_date,
              is_weekly: r.is_weekly,
              status: r.status, // RouteAssignmentStatus
            },
          });
          results.push(updated);
        } else {
          const created = await tx.routeAssignment.create({
            data: {
              route_id: r.route_id,
              driver_id: r.driver_id,
              vehicle_id: r.vehicle_id,
              association_id: r.association_id,
              start_date: r.start_date,
              end_date: r.end_date,
              is_weekly: r.is_weekly,
              status: r.status, // RouteAssignmentStatus
            },
          });
          results.push(created);
        }
      }
    });
    return results;
  }

  async approveMany(ids: number[]): Promise<number> {
    const res = await this.prisma.routeAssignment.updateMany({
      where: { id: { in: ids } },
      data: { status: 'Approved' },
    });
    return res.count;
  }

  findByIds(ids: number[]): Promise<RouteAssignment[]> {
    return this.prisma.routeAssignment.findMany({ where: { id: { in: ids } } });
  }
}
