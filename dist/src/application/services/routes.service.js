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
let RoutesService = class RoutesService {
    repo;
    constructor(repo) {
        this.repo = repo;
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
    upsertGroupWithRoutes(ctx, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin can modify routes');
        const args = {
            route_group_id: dto.route_group_id,
            route_group: dto.route_group,
            routes: dto.routes,
        };
        return this.repo.upsertGroupWithRoutes(args);
    }
    updateSingleRoute(ctx, id, r) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin can modify routes');
        return this.repo.updateSingleRoute(id, r);
    }
    async deleteGroup(ctx, id) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Only Admin/Superadmin can delete route groups');
        }
        return this.repo.deleteGroup(id);
    }
};
exports.RoutesService = RoutesService;
exports.RoutesService = RoutesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(route_repository_1.ROUTES_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], RoutesService);
//# sourceMappingURL=routes.service.js.map