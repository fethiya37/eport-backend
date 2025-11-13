"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapaSubaccountModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../prisma/prisma.module");
const chapa_subaccount_controller_1 = require("./chapa-subaccount.controller");
const association_subaccount_service_1 = require("../../application/services/association-subaccount.service");
const chapa_api_service_1 = require("../../infrastructure/payments/chapa-api.service");
const association_subaccount_repository_1 = require("../../domain/repositories/association-subaccount.repository");
const prisma_association_subaccount_repository_1 = require("../../infrastructure/repositories/prisma-association-subaccount.repository");
const activity_log_module_1 = require("../activity-log/activity-log.module");
let ChapaSubaccountModule = class ChapaSubaccountModule {
};
exports.ChapaSubaccountModule = ChapaSubaccountModule;
exports.ChapaSubaccountModule = ChapaSubaccountModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, activity_log_module_1.ActivityLogModule],
        controllers: [chapa_subaccount_controller_1.ChapaSubaccountController],
        providers: [
            association_subaccount_service_1.AssociationSubaccountService,
            chapa_api_service_1.ChapaApiService,
            { provide: association_subaccount_repository_1.ASSOCIATION_SUBACCOUNT_REPOSITORY, useClass: prisma_association_subaccount_repository_1.PrismaAssociationSubaccountRepository },
        ],
        exports: [association_subaccount_service_1.AssociationSubaccountService],
    })
], ChapaSubaccountModule);
//# sourceMappingURL=chapa-subaccount.module.js.map