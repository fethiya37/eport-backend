"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const payments_controller_1 = require("./payments.controller");
const prisma_service_1 = require("../../../prisma/prisma.service");
const driver_repository_1 = require("../../domain/repositories/driver.repository");
const prisma_driver_repository_1 = require("../../infrastructure/repositories/prisma-driver.repository");
const driver_payment_repository_1 = require("../../domain/repositories/driver-payment.repository");
const prisma_driver_payment_repository_1 = require("../../infrastructure/repositories/prisma-driver-payment.repository");
const association_policy_repository_1 = require("../../domain/repositories/association-policy.repository");
const prisma_association_policy_repository_1 = require("../../infrastructure/repositories/prisma-association-policy.repository");
const payments_service_1 = require("../../application/services/payments.service");
const route_assignment_module_1 = require("../route-assignment/route-assignment.module");
const sms_module_1 = require("../sms/sms.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        controllers: [payments_controller_1.PaymentsController],
        imports: [
            route_assignment_module_1.RouteAssignmentModule,
            sms_module_1.SmsModule,
        ],
        providers: [
            payments_service_1.PaymentsService,
            prisma_service_1.PrismaService,
            { provide: driver_repository_1.DRIVER_REPOSITORY, useClass: prisma_driver_repository_1.PrismaDriverRepository },
            { provide: driver_payment_repository_1.DRIVER_PAYMENT_REPOSITORY, useClass: prisma_driver_payment_repository_1.PrismaDriverPaymentRepository },
            { provide: association_policy_repository_1.ASSOCIATION_POLICY_REPOSITORY, useClass: prisma_association_policy_repository_1.PrismaAssociationPolicyRepository },
        ],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map