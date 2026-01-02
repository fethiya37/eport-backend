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
exports.ChapaSubaccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const association_context_guard_1 = require("../../infrastructure/auth/association-context.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const association_subaccount_service_1 = require("../../application/services/association-subaccount.service");
const chapa_api_service_1 = require("../../infrastructure/payments/chapa-api.service");
const create_subaccount_dto_1 = require("./dto/create-subaccount.dto");
let ChapaSubaccountController = class ChapaSubaccountController {
    svc;
    chapa;
    constructor(svc, chapa) {
        this.svc = svc;
        this.chapa = chapa;
    }
    async listBanks(country) {
        return this.chapa.listBanks(country ?? 'ET');
    }
    async create(user, dto) {
        return this.svc.createForMyAssociation(user, {
            bank_code: dto.bank_code,
            account_number: dto.account_number,
            account_name: dto.account_name,
            business_name: dto.business_name,
            split_type: dto.split_type,
            split_value: dto.split_value,
        });
    }
    async getMine(user) {
        return this.svc.getMine(user);
    }
    async remove(user, id) {
        return this.svc.hardDelete(user, id);
    }
};
exports.ChapaSubaccountController = ChapaSubaccountController;
__decorate([
    (0, common_1.Get)('banks'),
    (0, roles_decorator_1.Roles)('Association'),
    (0, swagger_1.ApiOperation)({ summary: 'List banks from Chapa' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, example: 'ET' }),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChapaSubaccountController.prototype, "listBanks", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    (0, roles_decorator_1.Roles)('Association'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Chapa subaccount (one per association)' }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_subaccount_dto_1.CreateSubaccountDto]),
    __metadata("design:returntype", Promise)
], ChapaSubaccountController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)('Association'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subaccount for my association' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChapaSubaccountController.prototype, "getMine", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Association'),
    (0, swagger_1.ApiOperation)({ summary: 'Hard delete a subaccount record (DB only) for my association' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChapaSubaccountController.prototype, "remove", null);
exports.ChapaSubaccountController = ChapaSubaccountController = __decorate([
    (0, swagger_1.ApiTags)('chapa-subaccounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, association_context_guard_1.AssociationContextGuard),
    (0, common_1.Controller)('chapa-subaccounts'),
    __metadata("design:paramtypes", [association_subaccount_service_1.AssociationSubaccountService,
        chapa_api_service_1.ChapaApiService])
], ChapaSubaccountController);
//# sourceMappingURL=chapa-subaccount.controller.js.map