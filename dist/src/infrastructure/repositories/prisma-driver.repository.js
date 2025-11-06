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
exports.PrismaDriverRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const roles_util_1 = require("../../common/auth/roles.util");
let PrismaDriverRepository = class PrismaDriverRepository {
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
    async create(ctx, data, tx) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot create drivers');
        }
        if (!ctx.association_id || ctx.association_id !== data.association_id) {
            throw new common_1.ForbiddenException('Cannot create driver for another association');
        }
        return tx.driver.create({
            data: {
                user_id: data.user_id,
                association_id: data.association_id,
                full_name: data.full_name,
                phone_number: data.phone_number,
                license_no: data.license_no ?? null,
                license_expiry: data.license_expiry ?? null,
                has_smartphone: data.has_smartphone ?? true,
            },
        });
    }
    async findAll(ctx, filter) {
        const baseScope = this.scopeWhere(ctx);
        const where = {
            ...baseScope,
            ...((0, roles_util_1.isAdminLike)(ctx.user_type) && filter?.association_id ? { association_id: filter.association_id } : {}),
            ...(filter?.id ? { id: filter.id } : {}),
            ...(filter?.full_name ? { full_name: { contains: filter.full_name, mode: 'insensitive' } } : {}),
            ...(filter?.phone_number ? { phone_number: filter.phone_number } : {}),
            ...(filter?.status ? { status: filter.status } : {}),
            ...(filter?.license_no ? { license_no: { contains: filter.license_no, mode: 'insensitive' } } : {}),
            ...(filter?.has_smartphone !== undefined ? { has_smartphone: filter.has_smartphone } : {}),
        };
        return this.prisma.driver.findMany({ where, orderBy: { id: 'asc' } });
    }
    async findById(ctx, id) {
        const d = await this.prisma.driver.findUnique({ where: { id } });
        if (!d)
            return null;
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type) && ctx.user_type !== 'Driver') {
            if (!ctx.association_id || d.association_id !== ctx.association_id) {
                throw new common_1.ForbiddenException('Not in your association');
            }
        }
        return d;
    }
    async update(ctx, id, data) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot update drivers');
        }
        const existing = await this.findById(ctx, id);
        if (!existing)
            throw new common_1.NotFoundException('Driver not found');
        const updateData = {
            ...(data.full_name !== undefined ? { full_name: data.full_name } : {}),
            ...(data.phone_number !== undefined ? { phone_number: data.phone_number } : {}),
            ...(data.status !== undefined ? { status: data.status } : {}),
            ...(data.license_no !== undefined ? { license_no: data.license_no } : {}),
            ...(data.license_expiry !== undefined ? { license_expiry: data.license_expiry } : {}),
            ...(data.has_smartphone !== undefined ? { has_smartphone: data.has_smartphone } : {}),
            ...(data.active_until_date !== undefined ? { active_until_date: data.active_until_date } : {}),
            ...(data.payment_status !== undefined ? { payment_status: data.payment_status } : {}),
            ...(data.interest_accrued !== undefined ? { interest_accrued: data.interest_accrued } : {}),
            ...(data.last_accrual_date !== undefined ? { last_accrual_date: data.last_accrual_date } : {}),
            ...(data.last_accrual_amount !== undefined ? { last_accrual_amount: data.last_accrual_amount } : {}),
        };
        return this.prisma.driver.update({ where: { id }, data: updateData });
    }
    async remove(ctx, id, tx) {
        const existing = await this.findById(ctx, id);
        if (!existing)
            throw new common_1.NotFoundException('Driver not found');
        return tx.driver.delete({ where: { id } });
    }
    async findWithoutVehicle(ctx) {
        const baseScope = this.scopeWhere(ctx);
        return this.prisma.driver.findMany({
            where: {
                ...baseScope,
                vehicle: null,
            },
            orderBy: { id: 'asc' },
        });
    }
};
exports.PrismaDriverRepository = PrismaDriverRepository;
exports.PrismaDriverRepository = PrismaDriverRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDriverRepository);
//# sourceMappingURL=prisma-driver.repository.js.map