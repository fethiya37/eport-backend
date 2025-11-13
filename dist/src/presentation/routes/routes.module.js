"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesModule = void 0;
const common_1 = require("@nestjs/common");
const routes_controller_1 = require("./routes.controller");
const routes_service_1 = require("../../application/services/routes.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
const prisma_route_repository_1 = require("../../infrastructure/repositories/prisma-route.repository");
const route_repository_1 = require("../../domain/repositories/route.repository");
const prisma_module_1 = require("../../../prisma/prisma.module");
const activity_log_module_1 = require("../activity-log/activity-log.module");
let RoutesModule = class RoutesModule {
};
exports.RoutesModule = RoutesModule;
exports.RoutesModule = RoutesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, activity_log_module_1.ActivityLogModule],
        controllers: [routes_controller_1.RoutesController],
        providers: [
            routes_service_1.RoutesService,
            prisma_service_1.PrismaService,
            { provide: route_repository_1.ROUTES_REPOSITORY, useClass: prisma_route_repository_1.PrismaRoutesRepository },
        ],
        exports: [routes_service_1.RoutesService],
    })
], RoutesModule);
//# sourceMappingURL=routes.module.js.map