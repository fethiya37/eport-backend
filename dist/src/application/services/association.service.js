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
exports.AssociationService = void 0;
const common_1 = require("@nestjs/common");
const association_repository_1 = require("../../domain/repositories/association.repository");
const prisma_service_1 = require("../../../prisma/prisma.service");
const roles_util_1 = require("../../common/auth/roles.util");
const activity_log_service_1 = require("../services/activity-log.service");
let AssociationService = class AssociationService {
    associations;
    prisma;
    activityLog;
    constructor(associations, prisma, activityLog) {
        this.associations = associations;
        this.prisma = prisma;
        this.activityLog = activityLog;
    }
    publicList(filter) {
        return this.associations.findAll(filter);
    }
    async publicGet(id) {
        const a = await this.associations.findById(id);
        if (!a)
            throw new common_1.NotFoundException('Association not found');
        return a;
    }
    async create(ctx, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const assoc = await this.associations.create({
            name: dto.name,
            phone_number: dto.phone_number ?? null,
            logo: dto.logo ?? null,
        });
        await this.activityLog.log(ctx, {
            module: 'Association',
            action: 'CREATE',
            entity: 'Association',
            entity_id: assoc.id,
        });
        return assoc;
    }
    async update(ctx, id, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const existing = await this.associations.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Association not found');
        const updated = await this.associations.update(id, {
            name: dto.name ?? existing.name,
            phone_number: dto.phone_number !== undefined ? dto.phone_number : existing.phone_number,
            logo: dto.logo !== undefined ? dto.logo : existing.logo,
        });
        await this.activityLog.log(ctx, {
            module: 'Association',
            action: 'UPDATE',
            entity: 'Association',
            entity_id: updated.id,
        });
        return updated;
    }
    async delete(ctx, id) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const existing = await this.associations.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Association not found');
        await this.prisma.$transaction(async (tx) => {
            await tx.driverPayment.deleteMany({ where: { association_id: id } });
            await tx.associationPolicy.deleteMany({ where: { association_id: id } });
            await tx.routeAssignment.deleteMany({ where: { association_id: id } });
            await tx.routeQuota.deleteMany({ where: { association_id: id } });
            await tx.vehicle.deleteMany({ where: { association_id: id } });
            await tx.driver.deleteMany({ where: { association_id: id } });
            await tx.owner.deleteMany({ where: { association_id: id } });
            await tx.user.deleteMany({ where: { association_id: id } });
            await tx.association.delete({ where: { id } });
        });
        await this.activityLog.log(ctx, {
            module: 'Association',
            action: 'DELETE',
            entity: 'Association',
            entity_id: id,
        });
        return { message: 'Association and all related records deleted successfully' };
    }
};
exports.AssociationService = AssociationService;
exports.AssociationService = AssociationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(association_repository_1.ASSOCIATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService])
], AssociationService);
//# sourceMappingURL=association.service.js.map