import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RouteQuota, RouteQuotaStatus } from '@prisma/client';
import {
  IRouteQuotaRepository,
  RouteQuotaCreateRow,
} from 'src/domain/repositories/route-quota.repository';

@Injectable()
export class PrismaRouteQuotaRepository implements IRouteQuotaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: RouteQuotaCreateRow): Promise<RouteQuota> {
    return this.prisma.routeQuota.create({
      data: {
        association_id: data.association_id,
        route_id: data.route_id,
        start_date: data.start_date,
        end_date: data.end_date,
        no_vehicles: data.no_vehicles,
        remaining_vehicles: data.remaining_vehicles ?? data.no_vehicles,
        status: data.status ?? RouteQuotaStatus.Pending, // ✅ enum
      },
    });
  }

  async createMany(rows: RouteQuotaCreateRow[]): Promise<RouteQuota[]> {
    return this.prisma.$transaction(
      rows.map((r) =>
        this.prisma.routeQuota.create({
          data: {
            association_id: r.association_id,
            route_id: r.route_id,
            start_date: r.start_date,
            end_date: r.end_date,
            no_vehicles: r.no_vehicles,
            remaining_vehicles: r.remaining_vehicles ?? r.no_vehicles,
            status: r.status ?? RouteQuotaStatus.Pending, // ✅ enum
          },
        }),
      ),
    );
  }

  find(filter: { association_id?: number; route_id?: number }): Promise<RouteQuota[]> {
    return this.prisma.routeQuota.findMany({
      where: {
        ...(filter.association_id ? { association_id: filter.association_id } : {}),
        ...(filter.route_id ? { route_id: filter.route_id } : {}),
      },
      orderBy: { id: 'asc' },
    });
  }

  async update(
    id: number,
    data: Partial<{
      start_date: Date;
      end_date: Date;
      no_vehicles: number;
      remaining_vehicles: number;
      status: RouteQuotaStatus; // ✅ enum type
    }>,
  ): Promise<RouteQuota> {
    return this.prisma.routeQuota.update({
      where: { id },
      data,
    });
  }

  findById(id: number): Promise<RouteQuota | null> {
    return this.prisma.routeQuota.findUnique({ where: { id } });
  }

  remove(id: number): Promise<RouteQuota> {
    return this.prisma.routeQuota.delete({ where: { id } });
  }
}
