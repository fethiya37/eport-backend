import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Prisma } from '@prisma/client';
import { IRoutesRepository, RouteFilter, RouteUpsertInput, UpsertGroupWithRoutesArgs } from 'src/domain/repositories/route.repository';

@Injectable()
export class PrismaRoutesRepository implements IRoutesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- READS ----------
  listRouteGroups(includeRoutes: boolean) {
    return this.prisma.routeGroup.findMany({
      orderBy: { id: 'asc' },
      include: includeRoutes ? { routes: { orderBy: { id: 'asc' } } } : undefined,
    });
  }

  listRoutes(filter: RouteFilter) {
    return this.prisma.route.findMany({
      where: {
        ...(filter.route_group_id ? { route_group_id: filter.route_group_id } : {}),
        ...(filter.departure_contains ? { departure: { contains: filter.departure_contains, mode: 'insensitive' } } : {}),
        ...(filter.arrival_contains ? { arrival: { contains: filter.arrival_contains, mode: 'insensitive' } } : {}),
      },
      orderBy: { id: 'asc' },
      include: { route_group: true },
    });
  }

  getRoute(id: number) {
    return this.prisma.route.findUnique({ where: { id }, include: { route_group: true } });
  }

  getRouteGroup(id: number, includeRoutes: boolean) {
    return this.prisma.routeGroup.findUnique({
      where: { id },
      include: includeRoutes ? { routes: { orderBy: { id: 'asc' } } } : undefined,
    });
  }

  // ---------- WRITES ----------
  async upsertGroupWithRoutes(args: UpsertGroupWithRoutesArgs) {
    const groupId = await this.ensureGroup(args);

    const result = await this.prisma.$transaction(async (tx) => {
      // rename group if both id & new name provided
      if (args.route_group_id && args.route_group) {
        await tx.routeGroup.update({
          where: { id: groupId },
          data: { route_group: args.route_group },
        });
      }

      for (const r of args.routes) {
        this.validateRouteInput(r);

        const data = {
          route_group_id: groupId,
          departure: r.departure,
          arrival: r.arrival,
          kilometer: r.kilometer === null || r.kilometer === undefined ? null : new Prisma.Decimal(r.kilometer as any),
          tariff: r.tariff === null || r.tariff === undefined ? null : new Prisma.Decimal(r.tariff as any),
        };

        if (r.id) {
          // ensure the route belongs to this group before updating
          const exists = await tx.route.findFirst({ where: { id: r.id, route_group_id: groupId } });
          if (!exists) throw new BadRequestException(`Route #${r.id} not found in this group`);
          await tx.route.update({ where: { id: r.id }, data });
        } else {
          await tx.route.create({ data });
        }
      }

      return tx.routeGroup.findUnique({
        where: { id: groupId },
        include: { routes: { orderBy: { id: 'asc' } } },
      }) as any;
    });

    return result;
  }

  async updateSingleRoute(id: number, r: RouteUpsertInput) {
    this.validateRouteInput(r);

    const existing = await this.prisma.route.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Route not found');

    return this.prisma.route.update({
      where: { id },
      data: {
        departure: r.departure,
        arrival: r.arrival,
        kilometer: r.kilometer === null || r.kilometer === undefined ? null : new Prisma.Decimal(r.kilometer as any),
        tariff: r.tariff === null || r.tariff === undefined ? null : new Prisma.Decimal(r.tariff as any),
      },
    });
  }

  // ---------- helpers ----------
  private async ensureGroup(args: UpsertGroupWithRoutesArgs): Promise<number> {
    if (args.route_group_id) {
      const group = await this.prisma.routeGroup.findUnique({ where: { id: args.route_group_id } });
      if (!group) throw new BadRequestException('route_group_id not found');
      return group.id;
    }
    if (!args.route_group || !args.route_group.trim()) {
      throw new BadRequestException('route_group is required when route_group_id is not provided');
    }
    const created = await this.prisma.routeGroup.create({ data: { route_group: args.route_group } });
    return created.id;
  }

  private validateRouteInput(r: RouteUpsertInput) {
    if (!r.departure?.trim()) throw new BadRequestException('departure is required');
    if (!r.arrival?.trim()) throw new BadRequestException('arrival is required');
  }
}
