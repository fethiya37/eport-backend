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
exports.ActivityLogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const association_context_guard_1 = require("../../infrastructure/auth/association-context.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const activity_log_service_1 = require("../../application/services/activity-log.service");
const log_filter_dto_1 = require("./dto/log-filter.dto");
let ActivityLogController = class ActivityLogController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findMany(user, query) {
        const { skip, take, date_from, date_to, ...rest } = query;
        const filter = {
            ...rest,
            ...(date_from ? { date_from: new Date(date_from) } : {}),
            ...(date_to ? { date_to: new Date(date_to) } : {}),
        };
        const logs = await this.service.findMany(user, filter, { skip, take });
        return logs.map((l) => ({
            id: l.id,
            user_id: l.user_id,
            user_name: l.user?.name ?? null,
            user_phone_number: l.user?.phone_number ?? null,
            user_type: l.user?.user_type ?? null,
            association_id: l.association_id,
            association_name: l.association?.name ?? null,
            action: l.action,
            entity_type: l.entity_type ?? null,
            entity_id: l.entity_id ?? null,
            description: l.description ?? null,
            ip_address: l.ip_address ?? null,
            created_at: l.created_at,
        }));
    }
    async findOne(user, id) {
        const l = await this.service.findOne(user, id);
        if (!l)
            return null;
        return {
            id: l.id,
            user_id: l.user_id,
            user_name: l.user?.name ?? null,
            user_phone_number: l.user?.phone_number ?? null,
            user_type: l.user?.user_type ?? null,
            association_id: l.association_id,
            association_name: l.association?.name ?? null,
            action: l.action,
            entity_type: l.entity_type ?? null,
            entity_id: l.entity_id ?? null,
            ip_address: l.ip_address ?? null,
            created_at: l.created_at,
        };
    }
};
exports.ActivityLogController = ActivityLogController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, log_filter_dto_1.LogFilterDto]),
    __metadata("design:returntype", Promise)
], ActivityLogController.prototype, "findMany", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ActivityLogController.prototype, "findOne", null);
exports.ActivityLogController = ActivityLogController = __decorate([
    (0, swagger_1.ApiTags)('activity-logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, association_context_guard_1.AssociationContextGuard),
    (0, common_1.Controller)('activity-logs'),
    __metadata("design:paramtypes", [activity_log_service_1.ActivityLogService])
], ActivityLogController);
//# sourceMappingURL=activity-log.controller.js.map