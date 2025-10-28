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
exports.PrismaAssociationSubaccountRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const roles_util_1 = require("../../common/auth/roles.util");
let PrismaAssociationSubaccountRepository = class PrismaAssociationSubaccountRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    ensureScope(ctx, association_id) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type))
            return;
        if (!ctx.association_id || ctx.association_id !== association_id) {
            throw new common_1.ForbiddenException('Not your association');
        }
    }
    async create(ctx, data, tx) {
        this.ensureScope(ctx, data.association_id);
        const client = tx ?? this.prisma;
        return client.associationSubaccount.create({ data });
    }
    async findByAssociationId(ctx, association_id) {
        this.ensureScope(ctx, association_id);
        return this.prisma.associationSubaccount.findUnique({ where: { association_id } });
    }
    async findById(ctx, id) {
        const row = await this.prisma.associationSubaccount.findUnique({ where: { id } });
        if (!row)
            return null;
        this.ensureScope(ctx, row.association_id);
        return row;
    }
    async hardDelete(ctx, id) {
        const row = await this.prisma.associationSubaccount.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('subaccount not found');
        this.ensureScope(ctx, row.association_id);
        await this.prisma.associationSubaccount.delete({ where: { id } });
    }
};
exports.PrismaAssociationSubaccountRepository = PrismaAssociationSubaccountRepository;
exports.PrismaAssociationSubaccountRepository = PrismaAssociationSubaccountRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAssociationSubaccountRepository);
//# sourceMappingURL=prisma-association-subaccount.repository.js.map