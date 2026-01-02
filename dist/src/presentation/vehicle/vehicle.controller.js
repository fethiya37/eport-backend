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
exports.VehicleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const association_context_guard_1 = require("../../infrastructure/auth/association-context.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const vehicle_service_1 = require("../../application/services/vehicle.service");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const update_vehicle_dto_1 = require("./dto/update-vehicle.dto");
const vehicle_filter_dto_1 = require("./dto/vehicle-filter.dto");
let VehicleController = class VehicleController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(user, filter) {
        return this.service.findAll(user, filter);
    }
    resolveForPayment(user, plate, driver_id) {
        return this.service.resolveForPayment(user, {
            plate,
            driver_id: driver_id ? Number(driver_id) : undefined,
        });
    }
    findOne(user, id) {
        return this.service.findOne(user, id);
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
    findAvailableForQuotaOrDirect(user, is_weekly, start_date, mode, association_id) {
        return this.service.findAvailableForQuotaOrDirect(user, {
            association_id,
            is_weekly,
            start_date: new Date(start_date),
            mode,
        });
    }
};
exports.VehicleController = VehicleController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, vehicle_filter_dto_1.VehicleFilterDto]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('resolve'),
    (0, roles_decorator_1.Roles)('Driver', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('plate')),
    __param(2, (0, common_1.Query)('driver_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "resolveForPayment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_vehicle_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_vehicle_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('available/for-quota-or-direct'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('is_weekly', common_1.ParseBoolPipe)),
    __param(2, (0, common_1.Query)('start_date')),
    __param(3, (0, common_1.Query)('mode')),
    __param(4, (0, common_1.Query)('association_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean, String, String, Number]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "findAvailableForQuotaOrDirect", null);
exports.VehicleController = VehicleController = __decorate([
    (0, swagger_1.ApiTags)('vehicles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, association_context_guard_1.AssociationContextGuard),
    (0, common_1.Controller)('vehicles'),
    __metadata("design:paramtypes", [vehicle_service_1.VehicleService])
], VehicleController);
//# sourceMappingURL=vehicle.controller.js.map