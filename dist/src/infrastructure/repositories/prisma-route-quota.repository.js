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
exports.PrismaRouteQuotaRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PrismaRouteQuotaRepository = class PrismaRouteQuotaRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.routeQuota.create({
            data: {
                association_id: data.association_id,
                route_id: data.route_id,
                start_date: data.start_date,
                end_date: data.end_date,
                no_vehicles: data.no_vehicles,
                remaining_vehicles: data.remaining_vehicles ?? data.no_vehicles,
                status: data.status ?? client_1.RouteQuotaStatus.Pending,
            },
        });
    }
    async createMany(rows) {
        return this.prisma.$transaction(rows.map((r) => this.prisma.routeQuota.create({
            data: {
                association_id: r.association_id,
                route_id: r.route_id,
                start_date: r.start_date,
                end_date: r.end_date,
                no_vehicles: r.no_vehicles,
                remaining_vehicles: r.remaining_vehicles ?? r.no_vehicles,
                status: r.status ?? client_1.RouteQuotaStatus.Pending,
            },
        })));
    }
    find(filter) {
        return this.prisma.routeQuota.findMany({
            where: {
                ...(filter.association_id ? { association_id: filter.association_id } : {}),
                ...(filter.route_id ? { route_id: filter.route_id } : {}),
            },
            orderBy: { id: 'asc' },
        });
    }
    async update(id, data) {
        return this.prisma.routeQuota.update({
            where: { id },
            data,
        });
    }
    findById(id) {
        return this.prisma.routeQuota.findUnique({ where: { id } });
    }
    remove(id) {
        return this.prisma.routeQuota.delete({ where: { id } });
    }
};
exports.PrismaRouteQuotaRepository = PrismaRouteQuotaRepository;
exports.PrismaRouteQuotaRepository = PrismaRouteQuotaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRouteQuotaRepository);
//# sourceMappingURL=prisma-route-quota.repository.js.map