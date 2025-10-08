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
exports.RouteQuotaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const route_quota_service_1 = require("../../application/services/route-quota.service");
const create_route_quota_dto_1 = require("./dto/create-route-quota.dto");
const update_route_quota_dto_1 = require("./dto/update-route-quota.dto");
const route_quota_filter_dto_1 = require("./dto/route-quota-filter.dto");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const create_many_route_quotas_dto_1 = require("./dto/create-many-route-quotas.dto");
let RouteQuotaController = class RouteQuotaController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(user, dto) {
        return this.service.create(user, dto);
    }
    find(user, filter) {
        return this.service.find(user, filter);
    }
    update(user, id, dto) {
        return this.service.update(user, id, dto);
    }
    createMany(user, dto) {
        return this.service.createMany(user, dto);
    }
    remove(user, id) {
        return this.service.remove(user, id);
    }
};
exports.RouteQuotaController = RouteQuotaController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_route_quota_dto_1.CreateRouteQuotaDto]),
    __metadata("design:returntype", void 0)
], RouteQuotaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, route_quota_filter_dto_1.RouteQuotaFilterDto]),
    __metadata("design:returntype", void 0)
], RouteQuotaController.prototype, "find", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    (0, swagger_1.ApiOperation)({ summary: 'Update route quota (Admins full edit, Association partial)' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_route_quota_dto_1.UpdateRouteQuotaDto]),
    __metadata("design:returntype", void 0)
], RouteQuotaController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_many_route_quotas_dto_1.CreateManyRouteQuotasDto]),
    __metadata("design:returntype", void 0)
], RouteQuotaController.prototype, "createMany", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], RouteQuotaController.prototype, "remove", null);
exports.RouteQuotaController = RouteQuotaController = __decorate([
    (0, swagger_1.ApiTags)('route-quotas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('route-quotas'),
    __metadata("design:paramtypes", [route_quota_service_1.RouteQuotaService])
], RouteQuotaController);
//# sourceMappingURL=route-quota.controller.js.map