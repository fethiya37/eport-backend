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
exports.RouteAssignmentService = void 0;
const common_1 = require("@nestjs/common");
const route_assignment_repository_1 = require("../../domain/repositories/route-assignment.repository");
const roles_util_1 = require("../../common/auth/roles.util");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../prisma/prisma.service");
const ethio_period_util_1 = require("../../common/utils/ethio-period.util");
const activity_log_service_1 = require("../services/activity-log.service");
let RouteAssignmentService = class RouteAssignmentService {
    repo;
    prisma;
    activityLog;
    constructor(repo, prisma, activityLog) {
        this.repo = repo;
        this.prisma = prisma;
        this.activityLog = activityLog;
    }
    parseGcDate(d) {
        if (d instanceof Date)
            return d;
        const s = d.trim();
        if (!s.includes('T')) {
            const [y, m, dd] = s.split('-').map((x) => parseInt(x, 10));
            return new Date(Date.UTC(y, m - 1, dd));
        }
        return new Date(s);
    }
    async existsRoute(route_id) {
        return !!(await this.prisma.route.findUnique({ where: { id: route_id } }));
    }
    async existsVehicleInAssociation(vehicle_id, association_id) {
        const v = await this.prisma.vehicle.findUnique({ where: { id: vehicle_id } });
        return !!v && v.association_id === association_id;
    }
    async existsVehicleOverlap(association_id, vehicle_id, start, end, excludeId) {
        const found = await this.prisma.routeAssignment.findFirst({
            where: {
                vehicle_id,
                association_id,
                ...(excludeId ? { id: { not: excludeId } } : {}),
                NOT: [{ end_date: { lt: start } }, { start_date: { gt: end } }],
            },
        });
        return !!found;
    }
    async bulkUpsert(ctx, dto) {
        const association_id = (0, roles_util_1.isAdminLike)(ctx.user_type)
            ? dto.association_id ?? ctx.association_id ?? null
            : ctx.association_id ?? null;
        if (!association_id)
            throw new common_1.BadRequestException('association_id is required');
        const now = new Date();
        const rows = [];
        for (const it of dto.items) {
            const start_date = this.parseGcDate(it.start_date);
            const end_date = this.parseGcDate(it.end_date);
            if (start_date > end_date)
                throw new common_1.BadRequestException('start_date must be <= end_date');
            if (!(await this.existsRoute(it.route_id))) {
                throw new common_1.BadRequestException(`Route ${it.route_id} not found`);
            }
            if (!(await this.existsVehicleInAssociation(it.vehicle_id, association_id))) {
                throw new common_1.BadRequestException(`Vehicle ${it.vehicle_id} not in association`);
            }
            const overlaps = await this.existsVehicleOverlap(association_id, it.vehicle_id, start_date, end_date, it.id);
            if (overlaps) {
                throw new common_1.BadRequestException(`Vehicle ${it.vehicle_id} has overlapping assignment`);
            }
            const driver = await this.prisma.driver.findFirst({
                where: { vehicle: { id: it.vehicle_id } },
                select: { active_until_date: true },
            });
            const payment_status = driver?.active_until_date && end_date <= driver.active_until_date
                ? client_1.PaymentStatus.ACTIVE
                : client_1.PaymentStatus.INACTIVE;
            rows.push({
                id: it.id,
                route_id: it.route_id,
                vehicle_id: it.vehicle_id,
                association_id,
                start_date,
                end_date,
                is_weekly: (await this.prisma.vehicle.findUnique({
                    where: { id: it.vehicle_id },
                    select: { is_weekly: true },
                }))?.is_weekly ?? false,
                status: (0, roles_util_1.isAdminLike)(ctx.user_type)
                    ? client_1.RouteAssignmentStatus.Approved
                    : client_1.RouteAssignmentStatus.Pending,
                assigned_by_user_id: ctx.userId,
                approved_by_user_id: (0, roles_util_1.isAdminLike)(ctx.user_type) ? ctx.userId : null,
                approved_at: (0, roles_util_1.isAdminLike)(ctx.user_type) ? now : null,
                route_quota_id: it.route_quota_id ?? null,
                history_status: it.history_status ?? undefined,
                payment_status,
            });
        }
        const saved = await this.repo.upsertMany(rows);
        for (const a of saved) {
            await this.activityLog.log(ctx, {
                module: 'RouteAssignment',
                action: 'UPSERT',
                entity: 'RouteAssignment',
                entity_id: a.id,
            });
        }
        return saved;
    }
    async approve(ctx, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const updated = await this.repo.approveMany(dto.ids, ctx.userId);
        for (const id of dto.ids) {
            await this.activityLog.log(ctx, {
                module: 'RouteAssignment',
                action: 'APPROVE',
                entity: 'RouteAssignment',
                entity_id: id,
            });
        }
        return { approved: updated };
    }
    async find(ctx, filter) {
        const f = { ...filter };
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type) && ctx.association_id) {
            f.association_id = ctx.association_id;
        }
        const date_from = f.date_from ? this.parseGcDate(f.date_from) : undefined;
        const date_to = f.date_to ? this.parseGcDate(f.date_to) : undefined;
        const results = await this.repo.find({
            association_id: f.association_id,
            route_id: f.route_id,
            status: f.status,
            date_from,
            date_to,
            vehicle_id: f.vehicle_id,
            payment_status: f.payment_status,
            route_quota_id: f.route_quota_id,
        });
        return results.map((r) => ({
            id: r.id,
            start_date: r.start_date,
            end_date: r.end_date,
            status: r.status,
            payment_status: r.payment_status,
            is_weekly: r.is_weekly,
            route_quota_id: r.route_quota_id,
            association: {
                id: r.association.id,
                name: r.association.name,
            },
            vehicle: {
                id: r.vehicle.id,
                plate_number: r.vehicle.plate_number,
                driver: r.vehicle.driver,
            },
            route: r.route,
            assigned_by: r.assigned_by,
            approved_by: r.approved_by,
        }));
    }
    async updateOne(ctx, id, dto) {
        const existing = (await this.repo.findByIds([id]))[0];
        if (!existing)
            throw new common_1.NotFoundException('Assignment not found');
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type) && existing.status === client_1.RouteAssignmentStatus.Approved) {
            throw new common_1.ForbiddenException('Association users cannot update approved assignments');
        }
        const start_date = dto.start_date ? this.parseGcDate(dto.start_date) : existing.start_date;
        const end_date = dto.end_date ? this.parseGcDate(dto.end_date) : existing.end_date;
        if (start_date > end_date)
            throw new common_1.BadRequestException('start_date must be <= end_date');
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicle_id ?? existing.vehicle_id },
            select: { is_weekly: true, driver_id: true },
        });
        if (!vehicle)
            throw new common_1.NotFoundException('Vehicle not found');
        const driver = vehicle.driver_id
            ? await this.prisma.driver.findUnique({
                where: { id: vehicle.driver_id },
                select: { active_until_date: true },
            })
            : null;
        const payment_status = driver?.active_until_date && end_date <= driver.active_until_date
            ? client_1.PaymentStatus.ACTIVE
            : client_1.PaymentStatus.INACTIVE;
        const [saved] = await this.repo.upsertMany([
            {
                id,
                route_id: dto.route_id ?? existing.route_id,
                vehicle_id: dto.vehicle_id ?? existing.vehicle_id,
                association_id: existing.association_id,
                start_date,
                end_date,
                is_weekly: vehicle.is_weekly,
                status: existing.status,
                assigned_by_user_id: existing.assigned_by_user_id,
                route_quota_id: dto.route_quota_id ?? existing.route_quota_id,
                history_status: dto.history_status ?? existing.history_status,
                payment_status,
            },
        ]);
        await this.activityLog.log(ctx, {
            module: 'RouteAssignment',
            action: 'UPDATE',
            entity: 'RouteAssignment',
            entity_id: saved.id,
        });
        return saved;
    }
    async remove(ctx, id) {
        const existing = (await this.repo.findByIds([id]))[0];
        if (!existing)
            throw new common_1.NotFoundException('Assignment not found');
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type) && existing.status === client_1.RouteAssignmentStatus.Approved) {
            throw new common_1.ForbiddenException('Association users cannot delete approved assignments');
        }
        const removed = await this.repo.remove(id);
        await this.activityLog.log(ctx, {
            module: 'RouteAssignment',
            action: 'DELETE',
            entity: 'RouteAssignment',
            entity_id: id,
        });
        return removed;
    }
    async visibleCoverage(ctx, q) {
        let vehicle = null;
        let driver = null;
        if (q.plate_number) {
            vehicle = await this.prisma.vehicle.findUnique({
                where: { plate_number: q.plate_number },
                select: {
                    id: true,
                    association_id: true,
                    driver_id: true,
                    is_weekly: true,
                    plate_number: true,
                    status: true,
                },
            });
            if (!vehicle)
                throw new common_1.NotFoundException('Vehicle not found');
            if (!vehicle.driver_id)
                throw new common_1.BadRequestException('No driver assigned to this vehicle');
            driver = await this.prisma.driver.findUnique({
                where: { id: vehicle.driver_id },
                select: {
                    id: true,
                    full_name: true,
                    phone_number: true,
                    active_until_date: true,
                    association_id: true,
                },
            });
        }
        else if (q.driver_id) {
            driver = await this.prisma.driver.findUnique({
                where: { id: q.driver_id },
                select: {
                    id: true,
                    full_name: true,
                    phone_number: true,
                    active_until_date: true,
                    association_id: true,
                    vehicle: {
                        select: {
                            id: true,
                            association_id: true,
                            is_weekly: true,
                            plate_number: true,
                            status: true,
                        },
                    },
                },
            });
            if (!driver)
                throw new common_1.NotFoundException('Driver not found');
            if (!driver.vehicle)
                throw new common_1.BadRequestException('No vehicle assigned to this driver');
            vehicle = {
                id: driver.vehicle.id,
                association_id: driver.vehicle.association_id,
                driver_id: driver.id,
                is_weekly: driver.vehicle.is_weekly,
                plate_number: driver.vehicle.plate_number,
                status: driver.vehicle.status,
            };
        }
        else {
            throw new common_1.BadRequestException('Either plate_number or driver_id is required');
        }
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        const today = (0, ethio_period_util_1.startOfDay)(new Date());
        if (!driver.active_until_date ||
            (0, ethio_period_util_1.startOfDay)(driver.active_until_date) < today ||
            vehicle.status === client_1.VehicleStatus.INACTIVE) {
            return { not_full_filled: true };
        }
        const windowStart = vehicle.is_weekly ? (0, ethio_period_util_1.startOfWeekMonday)(today) : (0, ethio_period_util_1.etMonthStart)(today);
        const windowEnd = (0, ethio_period_util_1.endOfDay)(driver.active_until_date);
        const assignments = await this.prisma.routeAssignment.findMany({
            where: {
                vehicle_id: vehicle.id,
                association_id: vehicle.association_id,
                status: { in: [client_1.RouteAssignmentStatus.Pending, client_1.RouteAssignmentStatus.Approved] },
                payment_status: client_1.PaymentStatus.ACTIVE,
                start_date: { gte: windowStart },
                end_date: { lte: windowEnd },
            },
            include: { route: true },
            orderBy: { start_date: 'asc' },
        });
        if (assignments.length === 0) {
            return {
                message: `Route assignment doesn't exist for ${windowStart
                    .toISOString()
                    .slice(0, 10)} - ${windowEnd.toISOString().slice(0, 10)}`,
                driver_active_until: driver.active_until_date.toISOString().slice(0, 10),
            };
        }
        const association = await this.prisma.association.findUnique({
            where: { id: vehicle.association_id },
            select: { name: true },
        });
        return {
            association_name: association?.name ?? '',
            plate_number: vehicle.plate_number,
            driver_name: driver.full_name,
            driver_active_until: driver.active_until_date.toISOString().slice(0, 10),
            assignments: assignments.map((r) => ({
                route: {
                    id: r.route.id,
                    departure: r.route.departure,
                    arrival: r.route.arrival,
                },
                start_date_gc: r.start_date.toISOString(),
                end_date_gc: r.end_date.toISOString(),
                status: r.status,
            })),
        };
    }
};
exports.RouteAssignmentService = RouteAssignmentService;
exports.RouteAssignmentService = RouteAssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(route_assignment_repository_1.ROUTE_ASSIGNMENT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService])
], RouteAssignmentService);
//# sourceMappingURL=route-assignment.service.js.map