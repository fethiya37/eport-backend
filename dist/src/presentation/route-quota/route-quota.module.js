"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteQuotaModule = void 0;
const common_1 = require("@nestjs/common");
const route_quota_controller_1 = require("./route-quota.controller");
const route_quota_service_1 = require("../../application/services/route-quota.service");
const prisma_module_1 = require("../../../prisma/prisma.module");
const route_quota_repository_1 = require("../../domain/repositories/route-quota.repository");
const prisma_route_quota_repository_1 = require("../../infrastructure/repositories/prisma-route-quota.repository");
const association_repository_1 = require("../../domain/repositories/association.repository");
const prisma_association_repository_1 = require("../../infrastructure/repositories/prisma-association.repository");
const route_repository_1 = require("../../domain/repositories/route.repository");
const prisma_route_repository_1 = require("../../infrastructure/repositories/prisma-route.repository");
let RouteQuotaModule = class RouteQuotaModule {
};
exports.RouteQuotaModule = RouteQuotaModule;
exports.RouteQuotaModule = RouteQuotaModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [route_quota_controller_1.RouteQuotaController],
        providers: [
            route_quota_service_1.RouteQuotaService,
            { provide: route_quota_repository_1.ROUTE_QUOTA_REPOSITORY, useClass: prisma_route_quota_repository_1.PrismaRouteQuotaRepository },
            { provide: association_repository_1.ASSOCIATION_REPOSITORY, useClass: prisma_association_repository_1.PrismaAssociationRepository },
            { provide: route_repository_1.ROUTES_REPOSITORY, useClass: prisma_route_repository_1.PrismaRoutesRepository },
        ],
        exports: [route_quota_service_1.RouteQuotaService],
    })
], RouteQuotaModule);
//# sourceMappingURL=route-quota.module.js.map