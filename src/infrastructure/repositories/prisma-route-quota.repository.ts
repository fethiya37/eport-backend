import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IRouteQuotaRepository } from '../../domain/repositories/route-quota.repository';
import { RouteQuota, Prisma } from '@prisma/client';

@Injectable()
export class PrismaRouteQuotaRepository implements IRouteQuotaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { association_id: number; route_id: number; start_date: Date; end_date: Date; no_vehicles: number }): Promise<RouteQuota> {
    return this.prisma.routeQuota.create({ data });
  }

  find(filter: { association_id?: number; route_id?: number }): Promise<RouteQuota[]> {
    const where: Prisma.RouteQuotaWhereInput = {
      ...(filter.association_id ? { association_id: filter.association_id } : {}),
      ...(filter.route_id ? { route_id: filter.route_id } : {}),
    };
    return this.prisma.routeQuota.findMany({ where, orderBy: { id: 'desc' } });
  }

  async update(id: number, data: Partial<{ start_date: Date; end_date: Date; no_vehicles: number }>): Promise<RouteQuota> {
    try {
      return await this.prisma.routeQuota.update({ where: { id }, data });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Route quota not found');
      throw e;
    }
  }

  findById(id: number): Promise<RouteQuota | null> {
    return this.prisma.routeQuota.findUnique({ where: { id } });
  }
}
