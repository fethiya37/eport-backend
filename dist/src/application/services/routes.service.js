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
exports.RoutesService = void 0;
const common_1 = require("@nestjs/common");
const roles_util_1 = require("../../common/auth/roles.util");
const route_repository_1 = require("../../domain/repositories/route.repository");
const activity_log_service_1 = require("../services/activity-log.service");
let RoutesService = class RoutesService {
    repo;
    activityLog;
    constructor(repo, activityLog) {
        this.repo = repo;
        this.activityLog = activityLog;
    }
    listRouteGroups(includeRoutes = false) {
        return this.repo.listRouteGroups(includeRoutes);
    }
    listRoutes(filter) {
        return this.repo.listRoutes(filter);
    }
    async getRoute(id) {
        const r = await this.repo.getRoute(id);
        if (!r)
            throw new common_1.NotFoundException('Route not found');
        return r;
    }
    async getRouteGroup(id, includeRoutes = true) {
        const g = await this.repo.getRouteGroup(id, includeRoutes);
        if (!g)
            throw new common_1.NotFoundException('Route group not found');
        return g;
    }
    async upsertGroupWithRoutes(ctx, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin can modify routes');
        const args = {
            route_group_id: dto.route_group_id,
            route_group: dto.route_group,
            routes: dto.routes,
        };
        const result = await this.repo.upsertGroupWithRoutes(args);
        await this.activityLog.log(ctx, {
            module: 'Routes',
            action: 'UPSERT_GROUP_WITH_ROUTES',
            entity: 'RouteGroup',
            entity_id: result.id ?? dto.route_group_id ?? null,
        });
        return result;
    }
    async updateSingleRoute(ctx, id, r) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin can modify routes');
        const updated = await this.repo.updateSingleRoute(id, r);
        await this.activityLog.log(ctx, {
            module: 'Routes',
            action: 'UPDATE_ROUTE',
            entity: 'Route',
            entity_id: id,
        });
        return updated;
    }
    async deleteGroup(ctx, id) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Only Admin/Superadmin can delete route groups');
        }
        const deleted = await this.repo.deleteGroup(id);
        await this.activityLog.log(ctx, {
            module: 'Routes',
            action: 'DELETE_GROUP',
            entity: 'RouteGroup',
            entity_id: id,
        });
        return deleted;
    }
};
exports.RoutesService = RoutesService;
exports.RoutesService = RoutesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(route_repository_1.ROUTES_REPOSITORY)),
    __metadata("design:paramtypes", [Object, activity_log_service_1.ActivityLogService])
], RoutesService);
//# sourceMappingURL=routes.service.js.map