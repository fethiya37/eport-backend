import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  IRoutesRepository,
  RouteFilter,
  RouteUpsertInput,
  UpsertGroupWithRoutesArgs,
} from 'src/domain/repositories/route.repository';

@Injectable()
export class PrismaRoutesRepository implements IRoutesRepository {
  constructor(private readonly prisma: PrismaService) {}

  listRouteGroups(includeRoutes: boolean) {
    return this.prisma.routeGroup.findMany({
      orderBy: { id: 'asc' },
      include: includeRoutes ? { routes: { orderBy: { id: 'asc' } } } : undefined,
    });
  }

  listRoutes(filter: RouteFilter) {
    const dep = filter.departure_contains?.trim();
    const arr = filter.arrival_contains?.trim();

    return this.prisma.route.findMany({
      where: {
        ...(filter.route_group_id ? { route_group_id: filter.route_group_id } : {}),
        ...(dep ? { departure: { contains: dep, mode: 'insensitive' } } : {}),
        ...(arr ? { arrival: { contains: arr, mode: 'insensitive' } } : {}),
      },
      orderBy: { id: 'asc' },
      include: { route_group: true },
    });
  }

  getRoute(id: number) {
    return this.prisma.route.findUnique({
      where: { id },
      include: { route_group: true },
    });
  }

  getRouteGroup(id: number, includeRoutes: boolean) {
    return this.prisma.routeGroup.findUnique({
      where: { id },
      include: includeRoutes ? { routes: { orderBy: { id: 'asc' } } } : undefined,
    });
  }

  async upsertGroupWithRoutes(args: UpsertGroupWithRoutesArgs) {
    const groupId = await this.ensureGroup(args);

    const result = await this.prisma.$transaction(async (tx) => {
      if (args.route_group_id && args.route_group) {
        const groupName = args.route_group.trim();
        await tx.routeGroup.update({
          where: { id: groupId },
          data: { route_group: groupName },
        });
      }

      const existingRoutes = await tx.route.findMany({
        where: { route_group_id: groupId },
        select: { id: true },
      });
      const existingIds = existingRoutes.map((r) => r.id);

      const incomingIds = args.routes.filter((r) => r.id).map((r) => r.id!);

      const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
      if (toDelete.length) {
        await tx.routeAssignment.deleteMany({ where: { route_id: { in: toDelete } } });
        await tx.routeQuota.deleteMany({ where: { route_id: { in: toDelete } } });
        await tx.route.deleteMany({ where: { id: { in: toDelete } } });
      }

      for (const r of args.routes) {
        this.validateRouteInput(r);

        const departure = r.departure.trim();
        const arrival = r.arrival.trim();

        const data = {
          route_group_id: groupId,
          departure,
          arrival,
          kilometer:
            r.kilometer === null || r.kilometer === undefined
              ? null
              : new Prisma.Decimal(r.kilometer as any),
          tariff:
            r.tariff === null || r.tariff === undefined
              ? null
              : new Prisma.Decimal(r.tariff as any),
        };

        if (r.id) {
          const exists = await tx.route.findFirst({
            where: { id: r.id, route_group_id: groupId },
          });
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

    const departure = r.departure.trim();
    const arrival = r.arrival.trim();

    return this.prisma.route.update({
      where: { id },
      data: {
        departure,
        arrival,
        kilometer:
          r.kilometer === null || r.kilometer === undefined
            ? null
            : new Prisma.Decimal(r.kilometer as any),
        tariff:
          r.tariff === null || r.tariff === undefined
            ? null
            : new Prisma.Decimal(r.tariff as any),
      },
    });
  }

  private async ensureGroup(args: UpsertGroupWithRoutesArgs): Promise<number> {
    if (args.route_group_id) {
      const group = await this.prisma.routeGroup.findUnique({
        where: { id: args.route_group_id },
      });
      if (!group) throw new BadRequestException('route_group_id not found');
      return group.id;
    }

    const name = args.route_group?.trim();
    if (!name) {
      throw new BadRequestException('route_group is required when route_group_id is not provided');
    }

    const created = await this.prisma.routeGroup.create({
      data: { route_group: name },
    });
    return created.id;
  }

  private validateRouteInput(r: RouteUpsertInput) {
    if (!r.departure?.trim()) throw new BadRequestException('departure is required');
    if (!r.arrival?.trim()) throw new BadRequestException('arrival is required');
  }

  async existsRoute(id: number): Promise<boolean> {
    const count = await this.prisma.route.count({ where: { id } });
    return count > 0;
  }

  async deleteGroup(id: number): Promise<void> {
    const group = await this.prisma.routeGroup.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Route group not found');

    await this.prisma.$transaction(async (tx) => {
      const routes = await tx.route.findMany({
        where: { route_group_id: id },
        select: { id: true },
      });
      const routeIds = routes.map((r) => r.id);

      if (routeIds.length) {
        await tx.routeAssignment.deleteMany({ where: { route_id: { in: routeIds } } });
        await tx.routeQuota.deleteMany({ where: { route_id: { in: routeIds } } });
        await tx.route.deleteMany({ where: { id: { in: routeIds } } });
      }

      await tx.routeGroup.delete({ where: { id } });
    });
  }
}
