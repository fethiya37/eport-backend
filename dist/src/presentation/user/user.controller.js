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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const user_service_1 = require("../../application/services/user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_filter_dto_1 = require("./dto/user-filter.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let UserController = class UserController {
    service;
    constructor(service) {
        this.service = service;
    }
    toSafeUser(u) {
        return {
            id: u.id,
            phone_number: u.phone_number,
            user_type: u.user_type,
            name: u.name ?? null,
            association_id: u.association_id ?? null,
            is_locked: !!u.is_locked,
            created_at: u.created_at,
            updated_at: u.updated_at,
        };
    }
    async create(user, dto) {
        const result = await this.service.create(user, dto);
        return {
            user: this.toSafeUser(result.user),
            temp_password: result.temp_password,
        };
    }
    async findAll(user, filter) {
        const normalized = {
            ...filter,
            is_locked: filter.is_locked === undefined ? undefined : filter.is_locked === 'true',
        };
        const list = await this.service.findAll(user, normalized);
        return list.map((u) => this.toSafeUser(u));
    }
    async findOne(user, id) {
        const u = await this.service.findOne(user, id);
        return this.toSafeUser(u);
    }
    async update(user, id, dto) {
        const updated = await this.service.update(user, id, dto);
        return this.toSafeUser(updated);
    }
    async remove(user, id) {
        const removed = await this.service.remove(user, id);
        return this.toSafeUser(removed);
    }
    async resetPassword(user, id) {
        return this.service.resetPasswordByAdmin(user, id);
    }
    async changeMyPassword(user, dto) {
        return this.service.changeOwnPassword(user, dto);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_filter_dto_1.UserFilterDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/reset-password'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Patch)('me/password'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changeMyPassword", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map