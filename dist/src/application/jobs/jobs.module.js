"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const billing_jobs_1 = require("./billing.jobs");
const prisma_service_1 = require("../../../prisma/prisma.service");
const route_assignment_repository_1 = require("../../domain/repositories/route-assignment.repository");
const prisma_route_assignment_repository_1 = require("../../infrastructure/repositories/prisma-route-assignment.repository");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            billing_jobs_1.BillingJobs,
            prisma_service_1.PrismaService,
            { provide: route_assignment_repository_1.ROUTE_ASSIGNMENT_REPOSITORY, useClass: prisma_route_assignment_repository_1.PrismaRouteAssignmentRepository },
        ],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map