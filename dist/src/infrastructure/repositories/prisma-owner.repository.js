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
exports.PrismaOwnerRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const roles_util_1 = require("../../common/auth/roles.util");
let PrismaOwnerRepository = class PrismaOwnerRepository {
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
            throw new common_1.ForbiddenException('Admin/Superadmin cannot create owners');
        }
        if (!ctx.association_id || ctx.association_id !== data.association_id) {
            throw new common_1.ForbiddenException('Cannot create owner for another association');
        }
        return tx.owner.create({
            data: {
                association_id: data.association_id,
                full_name: data.full_name,
                phone_number: data.phone_number,
            },
        });
    }
    async findAll(ctx, association_id) {
        const where = (0, roles_util_1.isAdminLike)(ctx.user_type)
            ? association_id
                ? { association_id }
                : {}
            : this.scopeWhere(ctx);
        return this.prisma.owner.findMany({
            where,
            orderBy: { id: 'asc' },
            include: { association: true },
        });
    }
    async findById(ctx, id) {
        const owner = await this.prisma.owner.findUnique({
            where: { id },
            include: { association: true },
        });
        if (!owner)
            return null;
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type)) {
            if (!ctx.association_id || owner.association_id !== ctx.association_id) {
                throw new common_1.ForbiddenException('Not in your association');
            }
        }
        return owner;
    }
    async update(ctx, id, data) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot update owners');
        }
        const existing = await this.findById(ctx, id);
        if (!existing)
            throw new common_1.NotFoundException('Owner not found');
        return this.prisma.owner.update({
            where: { id },
            data,
            include: { association: true },
        });
    }
    async remove(ctx, id) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot delete owners');
        }
        const existing = await this.findById(ctx, id);
        if (!existing)
            throw new common_1.NotFoundException('Owner not found');
        return this.prisma.owner.delete({
            where: { id },
            include: { association: true },
        });
    }
};
exports.PrismaOwnerRepository = PrismaOwnerRepository;
exports.PrismaOwnerRepository = PrismaOwnerRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaOwnerRepository);
//# sourceMappingURL=prisma-owner.repository.js.map