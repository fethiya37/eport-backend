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
exports.AssociationPolicyService = void 0;
const common_1 = require("@nestjs/common");
const association_policy_repository_1 = require("../../domain/repositories/association-policy.repository");
const roles_util_1 = require("../../common/auth/roles.util");
const activity_log_service_1 = require("./activity-log.service");
let AssociationPolicyService = class AssociationPolicyService {
    repo;
    activityLog;
    constructor(repo, activityLog) {
        this.repo = repo;
        this.activityLog = activityLog;
    }
    async upsert(ctx, dto) {
        if (!ctx.association_id)
            throw new common_1.BadRequestException('association_id required');
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type) && ctx.user_type !== 'Association') {
            throw new common_1.BadRequestException('Only Association/Admin can set policy');
        }
        const policy = await this.repo.upsert({
            association_id: ctx.association_id,
            ...dto,
        });
        await this.activityLog.log(ctx, {
            module: 'AssociationPolicy',
            action: 'UPSERT',
            entity: 'AssociationPolicy',
            entity_id: policy.association_id,
        });
        return policy;
    }
    get(ctx) {
        if (!ctx.association_id)
            throw new common_1.BadRequestException('association_id required');
        return this.repo.get(ctx.association_id);
    }
};
exports.AssociationPolicyService = AssociationPolicyService;
exports.AssociationPolicyService = AssociationPolicyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(association_policy_repository_1.ASSOCIATION_POLICY_REPOSITORY)),
    __metadata("design:paramtypes", [Object, activity_log_service_1.ActivityLogService])
], AssociationPolicyService);
//# sourceMappingURL=association-policy.service.js.map