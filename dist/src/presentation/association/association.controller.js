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
exports.AssociationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const association_service_1 = require("../../application/services/association.service");
const create_association_dto_1 = require("./dto/create-association.dto");
const update_association_dto_1 = require("./dto/update-association.dto");
const association_filter_dto_1 = require("./dto/association-filter.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let AssociationController = class AssociationController {
    service;
    constructor(service) {
        this.service = service;
    }
    publicList(filter) {
        return this.service.publicList(filter);
    }
    publicGet(id) {
        return this.service.publicGet(id);
    }
    create(user, dto) {
        return this.service.create(user, dto);
    }
    update(user, id, dto) {
        return this.service.update(user, id, dto);
    }
    delete(user, id) {
        return this.service.delete(user, id);
    }
};
exports.AssociationController = AssociationController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [association_filter_dto_1.AssociationFilterDto]),
    __metadata("design:returntype", void 0)
], AssociationController.prototype, "publicList", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AssociationController.prototype, "publicGet", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_association_dto_1.CreateAssociationDto]),
    __metadata("design:returntype", void 0)
], AssociationController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_association_dto_1.UpdateAssociationDto]),
    __metadata("design:returntype", void 0)
], AssociationController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], AssociationController.prototype, "delete", null);
exports.AssociationController = AssociationController = __decorate([
    (0, swagger_1.ApiTags)('associations'),
    (0, common_1.Controller)('associations'),
    __metadata("design:paramtypes", [association_service_1.AssociationService])
], AssociationController);
//# sourceMappingURL=association.controller.js.map