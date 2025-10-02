"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverModule = void 0;
const common_1 = require("@nestjs/common");
const driver_controller_1 = require("./driver.controller");
const driver_service_1 = require("../../application/services/driver.service");
const prisma_module_1 = require("../../../prisma/prisma.module");
const driver_repository_1 = require("../../domain/repositories/driver.repository");
const prisma_driver_repository_1 = require("../../infrastructure/repositories/prisma-driver.repository");
const association_policy_module_1 = require("../association-policy/association-policy.module");
let DriverModule = class DriverModule {
};
exports.DriverModule = DriverModule;
exports.DriverModule = DriverModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            association_policy_module_1.AssociationPolicyModule,
        ],
        controllers: [driver_controller_1.DriverController],
        providers: [
            driver_service_1.DriverService,
            { provide: driver_repository_1.DRIVER_REPOSITORY, useClass: prisma_driver_repository_1.PrismaDriverRepository },
        ],
        exports: [driver_service_1.DriverService],
    })
], DriverModule);
//# sourceMappingURL=driver.module.js.map