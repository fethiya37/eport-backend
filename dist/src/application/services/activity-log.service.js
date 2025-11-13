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
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const activity_log_repository_1 = require("../../domain/repositories/activity-log.repository");
const roles_util_1 = require("../../common/auth/roles.util");
let ActivityLogService = class ActivityLogService {
    logs;
    constructor(logs) {
        this.logs = logs;
    }
    async log(ctx, input) {
        const payload = {
            user_id: ctx ? ctx.userId ?? null : null,
            association_id: ctx?.association_id ?? null,
            action: `${input.module}:${input.action}`,
            entity_type: input.entity ?? null,
            entity_id: input.entity_id ?? null,
            description: null,
            ip_address: input.ip_address ?? null,
        };
        await this.logs.create(payload);
    }
    async findMany(ctx, filter, options) {
        const effectiveFilter = { ...filter };
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type)) {
            if (!ctx.association_id) {
                throw new common_1.ForbiddenException('Association context required');
            }
            effectiveFilter.association_id = ctx.association_id;
        }
        return this.logs.findMany(effectiveFilter, options);
    }
    async findOne(ctx, id) {
        const log = await this.logs.findById(id);
        if (!log)
            return null;
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type)) {
            if (!ctx.association_id || log.association_id !== ctx.association_id) {
                throw new common_1.ForbiddenException('Not allowed to view this log');
            }
        }
        return log;
    }
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(activity_log_repository_1.ACTIVITY_LOG_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map