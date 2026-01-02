"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRoutesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PrismaRoutesRepository = class PrismaRoutesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listRouteGroups(includeRoutes) {
        return this.prisma.routeGroup.findMany({
            orderBy: { id: 'asc' },
            include: includeRoutes ? { routes: { orderBy: { id: 'asc' } } } : undefined,
        });
    }
    listRoutes(filter) {
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
    getRoute(id) {
        return this.prisma.route.findUnique({
            where: { id },
            include: { route_group: true },
        });
    }
    getRouteGroup(id, includeRoutes) {
        return this.prisma.routeGroup.findUnique({
            where: { id },
            include: includeRoutes ? { routes: { orderBy: { id: 'asc' } } } : undefined,
        });
    }
    async upsertGroupWithRoutes(args) {
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
            const incomingIds = args.routes.filter((r) => r.id).map((r) => r.id);
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
                    kilometer: r.kilometer === null || r.kilometer === undefined
                        ? null
                        : new client_1.Prisma.Decimal(r.kilometer),
                    tariff: r.tariff === null || r.tariff === undefined
                        ? null
                        : new client_1.Prisma.Decimal(r.tariff),
                };
                if (r.id) {
                    const exists = await tx.route.findFirst({
                        where: { id: r.id, route_group_id: groupId },
                    });
                    if (!exists)
                        throw new common_1.BadRequestException(`Route #${r.id} not found in this group`);
                    await tx.route.update({ where: { id: r.id }, data });
                }
                else {
                    await tx.route.create({ data });
                }
            }
            return tx.routeGroup.findUnique({
                where: { id: groupId },
                include: { routes: { orderBy: { id: 'asc' } } },
            });
        });
        return result;
    }
    async updateSingleRoute(id, r) {
        this.validateRouteInput(r);
        const existing = await this.prisma.route.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Route not found');
        const departure = r.departure.trim();
        const arrival = r.arrival.trim();
        return this.prisma.route.update({
            where: { id },
            data: {
                departure,
                arrival,
                kilometer: r.kilometer === null || r.kilometer === undefined
                    ? null
                    : new client_1.Prisma.Decimal(r.kilometer),
                tariff: r.tariff === null || r.tariff === undefined
                    ? null
                    : new client_1.Prisma.Decimal(r.tariff),
            },
        });
    }
    async ensureGroup(args) {
        if (args.route_group_id) {
            const group = await this.prisma.routeGroup.findUnique({
                where: { id: args.route_group_id },
            });
            if (!group)
                throw new common_1.BadRequestException('route_group_id not found');
            return group.id;
        }
        const name = args.route_group?.trim();
        if (!name) {
            throw new common_1.BadRequestException('route_group is required when route_group_id is not provided');
        }
        const created = await this.prisma.routeGroup.create({
            data: { route_group: name },
        });
        return created.id;
    }
    validateRouteInput(r) {
        if (!r.departure?.trim())
            throw new common_1.BadRequestException('departure is required');
        if (!r.arrival?.trim())
            throw new common_1.BadRequestException('arrival is required');
    }
    async existsRoute(id) {
        const count = await this.prisma.route.count({ where: { id } });
        return count > 0;
    }
    async deleteGroup(id) {
        const group = await this.prisma.routeGroup.findUnique({ where: { id } });
        if (!group)
            throw new common_1.NotFoundException('Route group not found');
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
};
exports.PrismaRoutesRepository = PrismaRoutesRepository;
exports.PrismaRoutesRepository = PrismaRoutesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRoutesRepository);
//# sourceMappingURL=prisma-route.repository.js.map