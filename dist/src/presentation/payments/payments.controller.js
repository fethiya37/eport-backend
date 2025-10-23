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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const pay_dto_1 = require("./dto/pay.dto");
const payments_service_1 = require("../../application/services/payments.service");
const list_payments_dto_1 = require("./dto/list-payments.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let PaymentsController = class PaymentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    apply(user, dto) {
        return this.service.applyPayment(user, dto);
    }
    list(user, filters) {
        return this.service.listPayments(user, filters);
    }
    total(user) {
        return this.service.totalPayments(user);
    }
    onlineInit(user, dto) {
        return this.service.initOnlineFromPayDto(user, dto);
    }
    onlineReturn() {
        return `
      <div style="font-family:sans-serif;max-width:560px;margin:40px auto;text-align:center">
        <h2>Thanks! If your payment succeeded, we’ll confirm shortly.</h2>
        <p>You can close this tab now.</p>
      </div>
    `;
    }
    async callback(txRef) {
        if (!txRef)
            throw new common_1.BadRequestException('Missing trx_ref');
        try {
            return await this.service.recordAfterChapaSuccess(txRef);
        }
        catch (e) {
            return {
                recorded: false,
                status: 'error',
                message: e?.message ?? 'Unknown error',
            };
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('apply'),
    (0, roles_decorator_1.Roles)('Association', 'Driver'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pay_dto_1.PayDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_payments_dto_1.ListPaymentsDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('total'),
    (0, roles_decorator_1.Roles)('Association'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "total", null);
__decorate([
    (0, common_1.Post)('online/init'),
    (0, roles_decorator_1.Roles)('Association', 'Driver'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pay_dto_1.PayDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "onlineInit", null);
__decorate([
    (0, common_1.Get)('online/return'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "onlineReturn", null);
__decorate([
    (0, common_1.Get)('callback'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('trx_ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "callback", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map