"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociationPolicyModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../prisma/prisma.module");
const activity_log_module_1 = require("../activity-log/activity-log.module");
const association_policy_controller_1 = require("./association-policy.controller");
const association_policy_service_1 = require("../../application/services/association-policy.service");
const association_policy_repository_1 = require("../../domain/repositories/association-policy.repository");
const prisma_association_policy_repository_1 = require("../../infrastructure/repositories/prisma-association-policy.repository");
let AssociationPolicyModule = class AssociationPolicyModule {
};
exports.AssociationPolicyModule = AssociationPolicyModule;
exports.AssociationPolicyModule = AssociationPolicyModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, activity_log_module_1.ActivityLogModule],
        controllers: [association_policy_controller_1.AssociationPolicyController],
        providers: [
            association_policy_service_1.AssociationPolicyService,
            { provide: association_policy_repository_1.ASSOCIATION_POLICY_REPOSITORY, useClass: prisma_association_policy_repository_1.PrismaAssociationPolicyRepository },
        ],
        exports: [association_policy_service_1.AssociationPolicyService, association_policy_repository_1.ASSOCIATION_POLICY_REPOSITORY],
    })
], AssociationPolicyModule);
//# sourceMappingURL=association-policy.module.js.map