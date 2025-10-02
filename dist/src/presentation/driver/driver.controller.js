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
exports.DriverController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const association_context_guard_1 = require("../../infrastructure/auth/association-context.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const driver_service_1 = require("../../application/services/driver.service");
const create_driver_dto_1 = require("./dto/create-driver.dto");
const update_driver_dto_1 = require("./dto/update-driver.dto");
const driver_filter_dto_1 = require("./dto/driver-filter.dto");
let DriverController = class DriverController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(user, filter) {
        return this.service.findAll(user, filter);
    }
    findWithoutVehicle(user) {
        return this.service.findDriversWithoutVehicle(user);
    }
    findOne(user, id) {
        return this.service.findOneWithActive(user, id);
    }
    create(user, dto) {
        return this.service.create(user, dto);
    }
    update(user, id, dto) {
        return this.service.update(user, id, dto);
    }
    remove(user, id) {
        return this.service.remove(user, id);
    }
};
exports.DriverController = DriverController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, driver_filter_dto_1.DriverFilterDto]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('without-vehicle'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "findWithoutVehicle", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_driver_dto_1.CreateDriverDto]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_driver_dto_1.UpdateDriverDto]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "remove", null);
exports.DriverController = DriverController = __decorate([
    (0, swagger_1.ApiTags)('drivers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, association_context_guard_1.AssociationContextGuard),
    (0, common_1.Controller)('drivers'),
    __metadata("design:paramtypes", [driver_service_1.DriverService])
], DriverController);
//# sourceMappingURL=driver.controller.js.map