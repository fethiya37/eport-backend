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
exports.AssociationSubaccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const chapa_api_service_1 = require("../../infrastructure/payments/chapa-api.service");
const association_subaccount_repository_1 = require("../../domain/repositories/association-subaccount.repository");
const roles_util_1 = require("../../common/auth/roles.util");
const activity_log_service_1 = require("../services/activity-log.service");
let AssociationSubaccountService = class AssociationSubaccountService {
    prisma;
    chapa;
    repo;
    activityLog;
    constructor(prisma, chapa, repo, activityLog) {
        this.prisma = prisma;
        this.chapa = chapa;
        this.repo = repo;
        this.activityLog = activityLog;
    }
    resolveAssociationId(ctx, association_id) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            if (!association_id)
                throw new common_1.BadRequestException('association_id is required for admin/superadmin');
            return association_id;
        }
        if (!ctx.association_id)
            throw new common_1.ForbiddenException('association context missing');
        return ctx.association_id;
    }
    async createForAssociation(ctx, dto, association_id) {
        const assocId = this.resolveAssociationId(ctx, association_id);
        const assoc = await this.prisma.association.findUnique({ where: { id: assocId } });
        if (!assoc)
            throw new common_1.BadRequestException('association not found');
        const existing = await this.repo.findByAssociationId(ctx, assocId);
        if (existing)
            throw new common_1.BadRequestException('subaccount already exists for this association');
        const chapaResp = await this.chapa.createSubaccount({
            bank_code: dto.bank_code,
            account_number: dto.account_number,
            account_name: dto.account_name,
            business_name: dto.business_name,
            split_type: dto.split_type ?? 'percentage',
            split_value: dto.split_value ?? 1,
        });
        const chapaId = chapaResp?.data?.id || chapaResp?.data?.subaccount_id || chapaResp?.subaccount_id;
        if (!chapaId)
            throw new common_1.BadRequestException('invalid chapa response (no subaccount id)');
        const sub = await this.repo.create(ctx, {
            association_id: assocId,
            chapa_id: String(chapaId),
            business_name: dto.business_name,
            account_name: dto.account_name,
            account_number: dto.account_number,
        });
        await this.activityLog.log(ctx, {
            module: 'AssociationSubaccount',
            action: 'CREATE',
            entity: 'AssociationSubaccount',
            entity_id: sub.id,
        });
        return sub;
    }
    async getMine(ctx, association_id) {
        const assocId = this.resolveAssociationId(ctx, association_id);
        const row = await this.repo.findByAssociationId(ctx, assocId);
        if (!row)
            throw new common_1.NotFoundException('subaccount not found');
        return row;
    }
    async hardDelete(ctx, id) {
        await this.repo.hardDelete(ctx, id);
        await this.activityLog.log(ctx, {
            module: 'AssociationSubaccount',
            action: 'DELETE',
            entity: 'AssociationSubaccount',
            entity_id: id,
        });
        return { status: 'ok' };
    }
};
exports.AssociationSubaccountService = AssociationSubaccountService;
exports.AssociationSubaccountService = AssociationSubaccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(association_subaccount_repository_1.ASSOCIATION_SUBACCOUNT_REPOSITORY)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chapa_api_service_1.ChapaApiService, Object, activity_log_service_1.ActivityLogService])
], AssociationSubaccountService);
//# sourceMappingURL=association-subaccount.service.js.map