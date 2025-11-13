"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociationModule = void 0;
const common_1 = require("@nestjs/common");
const association_controller_1 = require("./association.controller");
const association_service_1 = require("../../application/services/association.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
const association_repository_1 = require("../../domain/repositories/association.repository");
const prisma_association_repository_1 = require("../../infrastructure/repositories/prisma-association.repository");
const prisma_module_1 = require("../../../prisma/prisma.module");
const activity_log_module_1 = require("../activity-log/activity-log.module");
let AssociationModule = class AssociationModule {
};
exports.AssociationModule = AssociationModule;
exports.AssociationModule = AssociationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, activity_log_module_1.ActivityLogModule],
        controllers: [association_controller_1.AssociationController],
        providers: [
            association_service_1.AssociationService,
            prisma_service_1.PrismaService,
            { provide: association_repository_1.ASSOCIATION_REPOSITORY, useClass: prisma_association_repository_1.PrismaAssociationRepository },
        ],
        exports: [association_service_1.AssociationService],
    })
], AssociationModule);
//# sourceMappingURL=association.module.js.map