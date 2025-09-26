import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IRouteQuotaRepository,
  RouteQuotaCreateRow,
} from '../../domain/repositories/route-quota.repository';
import { RouteQuota, Prisma } from '@prisma/client';

@Injectable()
export class PrismaRouteQuotaRepository implements IRouteQuotaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: RouteQuotaCreateRow): Promise<RouteQuota> {
    return this.prisma.routeQuota.create({ data }).catch((e: any) => {
      if (e?.code === 'P2002') {
        // in case you later add a unique constraint
        throw new BadRequestException('Quota for this window already exists');
      }
      throw e;
    });
  }

  // 👇 NEW
  async createMany(rows: RouteQuotaCreateRow[]): Promise<RouteQuota[]> {
    return this.prisma.$transaction(async (tx) => {
      const created: RouteQuota[] = [];
      for (const r of rows) {
        const q = await tx.routeQuota.create({ data: r }).catch((e: any) => {
          if (e?.code === 'P2002') {
            throw new BadRequestException('Quota for this window already exists');
          }
          throw e;
        });
        created.push(q);
      }
      return created;
    });
  }

  find(filter: { association_id?: number; route_id?: number }): Promise<RouteQuota[]> {
    const where: Prisma.RouteQuotaWhereInput = {
      ...(filter.association_id ? { association_id: filter.association_id } : {}),
      ...(filter.route_id ? { route_id: filter.route_id } : {}),
    };
    return this.prisma.routeQuota.findMany({ where, orderBy: { id: 'desc' } });
  }

  async update(
    id: number,
    data: Partial<{ start_date: Date; end_date: Date; no_vehicles: number }>
  ): Promise<RouteQuota> {
    try {
      return await this.prisma.routeQuota.update({ where: { id }, data });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Route quota not found');
      if (e?.code === 'P2002') {
        throw new BadRequestException('Quota for this window already exists');
      }
      throw e;
    }
  }

  findById(id: number): Promise<RouteQuota | null> {
    return this.prisma.routeQuota.findUnique({ where: { id } });
  }

  async remove(id: number): Promise<RouteQuota> {
  try {
    return await this.prisma.routeQuota.delete({ where: { id } });
  } catch (e: any) {
    if (e?.code === 'P2025') throw new NotFoundException('Route quota not found');
    throw e;
  }
}
}
