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
exports.OwnerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const association_context_guard_1 = require("../../infrastructure/auth/association-context.guard");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const owner_service_1 = require("../../application/services/owner.service");
const create_owner_dto_1 = require("./dto/create-owner.dto");
const update_owner_dto_1 = require("./dto/update-owner.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let OwnerController = class OwnerController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(user, association_id) {
        return this.service.findAll(user, association_id ? Number(association_id) : undefined);
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
};
exports.OwnerController = OwnerController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    (0, swagger_1.ApiQuery)({ name: 'association_id', required: false, type: Number, description: 'Filter by association (Admin/Superadmin only)' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('association_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_owner_dto_1.CreateOwnerDto]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_owner_dto_1.UpdateOwnerDto]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "remove", null);
exports.OwnerController = OwnerController = __decorate([
    (0, swagger_1.ApiTags)('owners'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, association_context_guard_1.AssociationContextGuard),
    (0, common_1.Controller)('owners'),
    __metadata("design:paramtypes", [owner_service_1.OwnerService])
], OwnerController);
//# sourceMappingURL=owner.controller.js.map