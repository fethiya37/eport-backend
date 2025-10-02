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
exports.OwnerService = void 0;
const common_1 = require("@nestjs/common");
const owner_repository_1 = require("../../domain/repositories/owner.repository");
const prisma_service_1 = require("../../../prisma/prisma.service");
const roles_util_1 = require("../../common/auth/roles.util");
let OwnerService = class OwnerService {
    owners;
    prisma;
    constructor(owners, prisma) {
        this.owners = owners;
        this.prisma = prisma;
    }
    async create(ctx, dto) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Admin/Superadmin cannot create owners');
        if (!ctx.association_id)
            throw new common_1.BadRequestException('association_id is required');
        const assoc = await this.prisma.association.findUnique({ where: { id: ctx.association_id } });
        if (!assoc)
            throw new common_1.BadRequestException('association not found');
        return this.prisma.$transaction((tx) => this.owners.create(ctx, {
            association_id: ctx.association_id,
            full_name: dto.full_name,
            phone_number: dto.phone_number,
        }, tx));
    }
    findAll(ctx, association_id) {
        return this.owners.findAll(ctx, association_id);
    }
    async findOne(ctx, id) {
        const owner = await this.owners.findById(ctx, id);
        if (!owner)
            throw new common_1.NotFoundException('Owner not found');
        return owner;
    }
    async update(ctx, id, dto) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot update owners');
        }
        const owner = await this.owners.findById(ctx, id);
        if (!owner)
            throw new common_1.NotFoundException('Owner not found');
        const patch = {};
        if (dto.full_name !== undefined)
            patch.full_name = dto.full_name;
        if (dto.phone_number !== undefined)
            patch.phone_number = dto.phone_number;
        return this.owners.update(ctx, id, patch);
    }
    async remove(ctx, id) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot delete owners');
        }
        const owner = await this.owners.findById(ctx, id);
        if (!owner)
            throw new common_1.NotFoundException('Owner not found');
        return this.owners.remove(ctx, id);
    }
};
exports.OwnerService = OwnerService;
exports.OwnerService = OwnerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(owner_repository_1.OWNER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], OwnerService);
//# sourceMappingURL=owner.service.js.map