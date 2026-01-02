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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteQuotaService = void 0;
const common_1 = require("@nestjs/common");
const route_quota_repository_1 = require("../../domain/repositories/route-quota.repository");
const association_repository_1 = require("../../domain/repositories/association.repository");
const route_repository_1 = require("../../domain/repositories/route.repository");
const roles_util_1 = require("../../common/auth/roles.util");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("../services/activity-log.service");
let RouteQuotaService = class RouteQuotaService {
    quotas;
    associations;
    routesRepo;
    prisma;
    activityLog;
    constructor(quotas, associations, routesRepo, prisma, activityLog) {
        this.quotas = quotas;
        this.associations = associations;
        this.routesRepo = routesRepo;
        this.prisma = prisma;
        this.activityLog = activityLog;
    }
    requireAssociationContext(ctx) {
        if (!ctx.association_id)
            throw new common_1.ForbiddenException('Association context required');
        return ctx.association_id;
    }
    async create(ctx, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const [assocOk, routeOk] = await Promise.all([
            this.associations.exists(dto.association_id),
            this.routesRepo.existsRoute(dto.route_id),
        ]);
        if (!assocOk)
            throw new common_1.BadRequestException('Association not found');
        if (!routeOk)
            throw new common_1.BadRequestException('Route not found');
        const start_date = this.parseGc(dto.start_date, 'start_date');
        const end_date = this.parseGc(dto.end_date, 'end_date');
        if (start_date > end_date)
            throw new common_1.BadRequestException('start_date must be <= end_date');
        await this.ensureCapacity(dto.association_id, dto.no_vehicles);
        await this.ensureNoOverlap(dto.association_id, dto.route_id, start_date, end_date);
        const created = await this.quotas.create({
            association_id: dto.association_id,
            route_id: dto.route_id,
            start_date,
            end_date,
            no_vehicles: dto.no_vehicles,
            remaining_vehicles: dto.no_vehicles,
            status: client_1.RouteQuotaStatus.Pending,
        });
        await this.activityLog.log(ctx, {
            module: 'RouteQuota',
            action: 'CREATE',
            entity: 'RouteQuota',
            entity_id: created.id,
        });
        return created;
    }
    async createMany(ctx, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const start_date = this.parseGc(dto.start_date, 'start_date');
        const end_date = this.parseGc(dto.end_date, 'end_date');
        if (start_date > end_date)
            throw new common_1.BadRequestException('start_date must be <= end_date');
        const assocOk = await this.associations.exists(dto.association_id);
        if (!assocOk)
            throw new common_1.BadRequestException('Association not found');
        const activePairs = await this.countActivePairs(dto.association_id);
        const rows = [];
        for (const item of dto.items) {
            const routeOk = await this.routesRepo.existsRoute(item.route_id);
            if (!routeOk)
                throw new common_1.BadRequestException(`Route ${item.route_id} not found`);
            if (item.no_vehicles > activePairs) {
                throw new common_1.BadRequestException(`no_vehicles for route ${item.route_id} exceeds active driver-vehicle pairs`);
            }
            await this.ensureNoOverlap(dto.association_id, item.route_id, start_date, end_date);
            rows.push({
                association_id: dto.association_id,
                route_id: item.route_id,
                start_date,
                end_date,
                no_vehicles: item.no_vehicles,
                remaining_vehicles: item.no_vehicles,
                status: client_1.RouteQuotaStatus.Pending,
            });
        }
        const created = await this.quotas.createMany(rows);
        for (const q of created) {
            await this.activityLog.log(ctx, {
                module: 'RouteQuota',
                action: 'CREATE_MANY',
                entity: 'RouteQuota',
                entity_id: q.id,
            });
        }
        return created;
    }
    find(ctx, filter) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type)) {
            const association_id = this.requireAssociationContext(ctx);
            filter.association_id = association_id;
        }
        return this.quotas.find(filter);
    }
    async update(ctx, id, dto) {
        const existing = await this.quotas.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Route quota not found');
        const isAssociation = ctx.user_type === 'Association';
        const isAdmin = (0, roles_util_1.isAdminLike)(ctx.user_type);
        if (!isAdmin && !isAssociation) {
            throw new common_1.ForbiddenException('Only Admin, Superadmin or Association can update quota');
        }
        if (isAssociation) {
            const association_id = this.requireAssociationContext(ctx);
            if (association_id !== existing.association_id) {
                throw new common_1.ForbiddenException('Cannot modify quota outside your association');
            }
        }
        const approvedCount = await this.prisma.routeAssignment.count({
            where: { route_quota_id: id, status: 'Approved' },
        });
        if (approvedCount > 0 && !isAdmin) {
            throw new common_1.ForbiddenException('Cannot update quota with approved assignments');
        }
        const patch = {};
        if (isAdmin) {
            if (dto.start_date)
                patch.start_date = this.parseGc(dto.start_date, 'start_date');
            if (dto.end_date)
                patch.end_date = this.parseGc(dto.end_date, 'end_date');
            if (patch.start_date && patch.end_date && patch.start_date > patch.end_date) {
                throw new common_1.BadRequestException('start_date must be <= end_date');
            }
            if (dto.no_vehicles !== undefined) {
                await this.ensureCapacity(existing.association_id, dto.no_vehicles);
                patch.no_vehicles = dto.no_vehicles;
            }
            if (dto.remaining_vehicles !== undefined) {
                if (dto.remaining_vehicles < 0 ||
                    dto.remaining_vehicles > (dto.no_vehicles ?? existing.no_vehicles)) {
                    throw new common_1.BadRequestException('remaining_vehicles must be between 0 and no_vehicles');
                }
                patch.remaining_vehicles = dto.remaining_vehicles;
            }
            if (dto.status !== undefined) {
                patch.status = dto.status;
            }
        }
        if (isAssociation) {
            if (dto.remaining_vehicles !== undefined) {
                if (dto.remaining_vehicles < 0 || dto.remaining_vehicles > existing.no_vehicles) {
                    throw new common_1.BadRequestException('remaining_vehicles must be between 0 and no_vehicles');
                }
                patch.remaining_vehicles = dto.remaining_vehicles;
            }
            if (dto.status !== undefined) {
                if (dto.status !== client_1.RouteQuotaStatus.Fulfilled) {
                    throw new common_1.ForbiddenException('Association can only mark quota as Fulfilled');
                }
                patch.status = dto.status;
            }
        }
        if (isAdmin) {
            await this.ensureNoOverlap(existing.association_id, existing.route_id, patch.start_date ?? existing.start_date, patch.end_date ?? existing.end_date, id);
        }
        const updated = await this.quotas.update(id, patch);
        await this.activityLog.log(ctx, {
            module: 'RouteQuota',
            action: 'UPDATE',
            entity: 'RouteQuota',
            entity_id: updated.id,
        });
        return updated;
    }
    parseGc(input, field) {
        const d = input instanceof Date ? input : new Date(input);
        if (isNaN(d.getTime()))
            throw new common_1.BadRequestException(`${field} must be a valid GC date`);
        return d;
    }
    async countActivePairs(association_id) {
        return this.prisma.vehicle.count({
            where: {
                association_id,
                status: client_1.VehicleStatus.ACTIVE,
                driver_id: { not: null },
            },
        });
    }
    async ensureCapacity(association_id, requestedNoVehicles) {
        const activePairs = await this.countActivePairs(association_id);
        if (requestedNoVehicles > activePairs) {
            throw new common_1.BadRequestException('no_vehicles cannot exceed active driver-vehicle pairs');
        }
    }
    async ensureNoOverlap(association_id, route_id, start, end, excludeId) {
        const overlapping = await this.prisma.routeQuota.findFirst({
            where: {
                association_id,
                route_id,
                ...(excludeId ? { id: { not: excludeId } } : {}),
                NOT: [{ end_date: { lt: start } }, { start_date: { gt: end } }],
            },
        });
        if (overlapping) {
            throw new common_1.BadRequestException('Quota window overlaps an existing quota for this route and association');
        }
    }
    async remove(ctx, id) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const existing = await this.quotas.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Route quota not found');
        const approvedCount = await this.prisma.routeAssignment.count({
            where: { route_quota_id: id, status: 'Approved' },
        });
        if (approvedCount > 0) {
            throw new common_1.ForbiddenException('Cannot delete quota with approved assignments');
        }
        const removed = await this.quotas.remove(id);
        await this.activityLog.log(ctx, {
            module: 'RouteQuota',
            action: 'DELETE',
            entity: 'RouteQuota',
            entity_id: id,
        });
        return removed;
    }
};
exports.RouteQuotaService = RouteQuotaService;
exports.RouteQuotaService = RouteQuotaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(route_quota_repository_1.ROUTE_QUOTA_REPOSITORY)),
    __param(1, (0, common_1.Inject)(association_repository_1.ASSOCIATION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(route_repository_1.ROUTES_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService])
], RouteQuotaService);
//# sourceMappingURL=route-quota.service.js.map