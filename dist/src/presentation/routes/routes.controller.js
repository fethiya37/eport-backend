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
exports.RoutesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const routes_service_1 = require("../../application/services/routes.service");
const upsert_group_with_routes_dto_1 = require("./dto/upsert-group-with-routes.dto");
const route_filter_dto_1 = require("./dto/route-filter.dto");
const route_input_dto_1 = require("./dto/route-input.dto");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
let RoutesController = class RoutesController {
    service;
    constructor(service) {
        this.service = service;
    }
    listGroups(includeRoutes) {
        return this.service.listRouteGroups(Boolean(includeRoutes));
    }
    listRoutes(filter) {
        return this.service.listRoutes(filter);
    }
    getRoute(id) {
        return this.service.getRoute(id);
    }
    getGroup(id) {
        return this.service.getRouteGroup(id, true);
    }
    upsertGroupWithRoutes(user, dto) {
        return this.service.upsertGroupWithRoutes(user, dto);
    }
    updateSingleRoute(user, id, body) {
        return this.service.updateSingleRoute(user, id, body);
    }
    deleteGroup(user, id) {
        return this.service.deleteGroup(user, id);
    }
};
exports.RoutesController = RoutesController;
__decorate([
    (0, common_1.Get)('groups'),
    __param(0, (0, common_1.Query)('includeRoutes', new common_1.ParseBoolPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", void 0)
], RoutesController.prototype, "listGroups", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [route_filter_dto_1.RouteFilterDto]),
    __metadata("design:returntype", void 0)
], RoutesController.prototype, "listRoutes", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RoutesController.prototype, "getRoute", null);
__decorate([
    (0, common_1.Get)('groups/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RoutesController.prototype, "getGroup", null);
__decorate([
    (0, common_1.Post)('upsert-group-with-routes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upsert_group_with_routes_dto_1.UpsertGroupWithRoutesDto]),
    __metadata("design:returntype", void 0)
], RoutesController.prototype, "upsertGroupWithRoutes", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, route_input_dto_1.RouteInputDto]),
    __metadata("design:returntype", void 0)
], RoutesController.prototype, "updateSingleRoute", null);
__decorate([
    (0, common_1.Delete)('groups/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], RoutesController.prototype, "deleteGroup", null);
exports.RoutesController = RoutesController = __decorate([
    (0, swagger_1.ApiTags)('routes'),
    (0, common_1.Controller)('routes'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [routes_service_1.RoutesService])
], RoutesController);
//# sourceMappingURL=routes.controller.js.map