"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../prisma/prisma.module");
const vehicle_controller_1 = require("./vehicle.controller");
const vehicle_service_1 = require("../../application/services/vehicle.service");
const vehicle_repository_1 = require("../../domain/repositories/vehicle.repository");
const prisma_vehicle_repository_1 = require("../../infrastructure/repositories/prisma-vehicle.repository");
const association_policy_module_1 = require("../association-policy/association-policy.module");
const activity_log_module_1 = require("../activity-log/activity-log.module");
let VehicleModule = class VehicleModule {
};
exports.VehicleModule = VehicleModule;
exports.VehicleModule = VehicleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            association_policy_module_1.AssociationPolicyModule,
            activity_log_module_1.ActivityLogModule,
        ],
        controllers: [vehicle_controller_1.VehicleController],
        providers: [
            vehicle_service_1.VehicleService,
            { provide: vehicle_repository_1.VEHICLE_REPOSITORY, useClass: prisma_vehicle_repository_1.PrismaVehicleRepository }
        ],
        exports: [vehicle_service_1.VehicleService],
    })
], VehicleModule);
//# sourceMappingURL=vehicle.module.js.map