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
exports.PrismaVehicleRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const roles_util_1 = require("../../common/auth/roles.util");
let PrismaVehicleRepository = class PrismaVehicleRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    scopeWhere(ctx) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type))
            return {};
        if (!ctx.association_id)
            throw new common_1.ForbiddenException('Association context required');
        return { association_id: ctx.association_id };
    }
    async create(ctx, data) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Admin/Superadmin cannot create vehicles');
        if (!ctx.association_id || ctx.association_id !== data.association_id) {
            throw new common_1.ForbiddenException('Cannot create vehicle for another association');
        }
        const owner = await this.prisma.owner.findUnique({ where: { id: data.owner_id } });
        if (!owner || owner.association_id !== data.association_id) {
            throw new common_1.BadRequestException('Owner not found in your association');
        }
        if (data.driver_id) {
            const driver = await this.prisma.driver.findUnique({ where: { id: data.driver_id } });
            if (!driver || driver.association_id !== data.association_id) {
                throw new common_1.BadRequestException('Driver not found in your association');
            }
        }
        try {
            return await this.prisma.vehicle.create({
                data: {
                    plate_number: data.plate_number,
                    libre_no: data.libre_no ?? null,
                    owner_id: data.owner_id,
                    association_id: data.association_id,
                    driver_id: data.driver_id ?? null,
                    make: data.make ?? null,
                    model: data.model ?? null,
                    color: data.color ?? null,
                    capacity: data.capacity ?? null,
                    status: client_1.VehicleStatus.ACTIVE,
                    is_weekly: data.is_weekly,
                },
            });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                const target = Array.isArray(err.meta?.target)
                    ? err.meta?.target
                    : [String(err.meta?.target ?? '')];
                if (target.includes('plate_number')) {
                    throw new common_1.BadRequestException('Plate number already exists');
                }
                if (target.includes('driver_id')) {
                    throw new common_1.BadRequestException('This driver is already assigned to another vehicle');
                }
            }
            throw err;
        }
    }
    async findAll(ctx, filter) {
        const baseScope = this.scopeWhere(ctx);
        const where = {
            ...baseScope,
            ...((0, roles_util_1.isAdminLike)(ctx.user_type) && filter?.association_id
                ? { association_id: filter.association_id }
                : {}),
            ...(filter?.id ? { id: filter.id } : {}),
            ...(filter?.plate_number ? { plate_number: filter.plate_number } : {}),
            ...(filter?.status ? { status: filter.status } : {}),
            ...(filter?.owner_id ? { owner_id: filter.owner_id } : {}),
            ...(filter?.driver_id ? { driver_id: filter.driver_id } : {}),
            ...(filter?.make ? { make: { contains: filter.make, mode: 'insensitive' } } : {}),
            ...(filter?.model ? { model: { contains: filter.model, mode: 'insensitive' } } : {}),
            ...(filter?.color ? { color: { contains: filter.color, mode: 'insensitive' } } : {}),
        };
        return this.prisma.vehicle.findMany({
            where,
            orderBy: { id: 'asc' },
            include: { association: true, owner: true, driver: true },
        });
    }
    async findById(ctx, id) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: { association: true, owner: true, driver: true },
        });
        if (!vehicle)
            return null;
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type)) {
            if (!ctx.association_id || vehicle.association_id !== ctx.association_id) {
                throw new common_1.ForbiddenException('Not in your association');
            }
        }
        return vehicle;
    }
    async findActiveWithoutDriver(ctx) {
        return this.prisma.vehicle.findMany({
            where: {
                ...this.scopeWhere(ctx),
                status: client_1.VehicleStatus.ACTIVE,
                driver_id: null,
            },
            include: { association: true, owner: true },
        });
    }
    async update(ctx, id, data) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Admin/Superadmin cannot update vehicles');
        const existing = await this.findById(ctx, id);
        if (!existing)
            throw new common_1.NotFoundException('Vehicle not found');
        if (data.owner_id) {
            const owner = await this.prisma.owner.findUnique({ where: { id: data.owner_id } });
            if (!owner || owner.association_id !== existing.association_id) {
                throw new common_1.BadRequestException('Owner must belong to the same association');
            }
        }
        if (data.driver_id) {
            const driver = await this.prisma.driver.findUnique({ where: { id: data.driver_id } });
            if (!driver || driver.association_id !== existing.association_id) {
                throw new common_1.BadRequestException('Driver must belong to the same association');
            }
        }
        try {
            return await this.prisma.vehicle.update({
                where: { id },
                data: {
                    ...(data.plate_number !== undefined ? { plate_number: data.plate_number } : {}),
                    ...(data.libre_no !== undefined ? { libre_no: data.libre_no } : {}),
                    ...(data.owner_id !== undefined ? { owner_id: data.owner_id } : {}),
                    ...(data.driver_id !== undefined ? { driver_id: data.driver_id } : {}),
                    ...(data.make !== undefined ? { make: data.make } : {}),
                    ...(data.model !== undefined ? { model: data.model } : {}),
                    ...(data.color !== undefined ? { color: data.color } : {}),
                    ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
                    ...(data.status !== undefined ? { status: data.status } : {}),
                    ...(data.is_weekly !== undefined ? { is_weekly: data.is_weekly } : {}),
                },
                include: { association: true, owner: true, driver: true },
            });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                const target = Array.isArray(err.meta?.target)
                    ? err.meta?.target
                    : [String(err.meta?.target ?? '')];
                if (target.includes('plate_number')) {
                    throw new common_1.BadRequestException('Plate number already exists');
                }
                if (target.includes('driver_id')) {
                    throw new common_1.BadRequestException('This driver is already assigned to another vehicle');
                }
            }
            throw err;
        }
    }
    async remove(ctx, id) {
        const existing = await this.findById(ctx, id);
        if (!existing)
            throw new common_1.NotFoundException('Vehicle not found');
        return this.prisma.vehicle.delete({
            where: { id },
            include: { association: true, owner: true, driver: true },
        });
    }
    async findAvailableForQuotaOrDirect(ctx, input) {
        const assocId = (0, roles_util_1.isAdminLike)(ctx.user_type) ? input.association_id : ctx.association_id;
        if (!assocId)
            throw new common_1.BadRequestException('association_id is required');
        const vehicles = await this.prisma.vehicle.findMany({
            where: {
                association_id: assocId,
                status: client_1.VehicleStatus.ACTIVE,
                is_weekly: input.is_weekly,
                driver_id: { not: null },
            },
            include: input.mode === 'direct' ? { driver: true } : undefined,
        });
        const available = [];
        for (const v of vehicles) {
            const latest = await this.prisma.routeAssignment.findFirst({
                where: {
                    vehicle_id: v.id,
                    association_id: assocId,
                    status: { in: ['Pending', 'Approved'] },
                },
                orderBy: { end_date: 'desc' },
            });
            if (!latest || latest.end_date < input.start_date) {
                available.push(v);
            }
        }
        if (input.mode === 'quota') {
            return { count: available.length };
        }
        return { count: available.length, vehicles: available };
    }
};
exports.PrismaVehicleRepository = PrismaVehicleRepository;
exports.PrismaVehicleRepository = PrismaVehicleRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaVehicleRepository);
//# sourceMappingURL=prisma-vehicle.repository.js.map