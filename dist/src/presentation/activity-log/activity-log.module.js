"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../prisma/prisma.module");
const activity_log_controller_1 = require("./activity-log.controller");
const activity_log_service_1 = require("../../application/services/activity-log.service");
const activity_log_repository_1 = require("../../domain/repositories/activity-log.repository");
const prisma_activity_log_repository_1 = require("../../infrastructure/repositories/prisma-activity-log.repository");
let ActivityLogModule = class ActivityLogModule {
};
exports.ActivityLogModule = ActivityLogModule;
exports.ActivityLogModule = ActivityLogModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [activity_log_controller_1.ActivityLogController],
        providers: [
            activity_log_service_1.ActivityLogService,
            {
                provide: activity_log_repository_1.ACTIVITY_LOG_REPOSITORY,
                useClass: prisma_activity_log_repository_1.PrismaActivityLogRepository,
            },
        ],
        exports: [activity_log_service_1.ActivityLogService],
    })
], ActivityLogModule);
//# sourceMappingURL=activity-log.module.js.map