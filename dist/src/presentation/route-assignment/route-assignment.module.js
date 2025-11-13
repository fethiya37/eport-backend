"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteAssignmentModule = void 0;
const common_1 = require("@nestjs/common");
const route_assignment_controller_1 = require("./route-assignment.controller");
const route_assignment_service_1 = require("../../application/services/route-assignment.service");
const prisma_module_1 = require("../../../prisma/prisma.module");
const route_assignment_repository_1 = require("../../domain/repositories/route-assignment.repository");
const prisma_route_assignment_repository_1 = require("../../infrastructure/repositories/prisma-route-assignment.repository");
const activity_log_module_1 = require("../activity-log/activity-log.module");
let RouteAssignmentModule = class RouteAssignmentModule {
};
exports.RouteAssignmentModule = RouteAssignmentModule;
exports.RouteAssignmentModule = RouteAssignmentModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, activity_log_module_1.ActivityLogModule],
        controllers: [route_assignment_controller_1.RouteAssignmentController],
        providers: [
            route_assignment_service_1.RouteAssignmentService,
            { provide: route_assignment_repository_1.ROUTE_ASSIGNMENT_REPOSITORY, useClass: prisma_route_assignment_repository_1.PrismaRouteAssignmentRepository },
        ],
        exports: [route_assignment_service_1.RouteAssignmentService],
    })
], RouteAssignmentModule);
//# sourceMappingURL=route-assignment.module.js.map