"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LogCleanupJobs_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogCleanupJobs = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../prisma/prisma.service");
let LogCleanupJobs = LogCleanupJobs_1 = class LogCleanupJobs {
    prisma;
    logger = new common_1.Logger(LogCleanupJobs_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async cleanupOldActivityLogs() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        try {
            const deleted = await this.prisma.activityLog.deleteMany({
                where: {
                    created_at: {
                        lt: thirtyDaysAgo,
                    },
                },
            });
            this.logger.log(`Cleaned up ${deleted.count} activity logs older than 30 days`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to cleanup activity logs: ${errorMessage}`);
        }
    }
    async cleanupExpiredTokens() {
        const now = new Date();
        try {
            const deletedTokens = await this.prisma.userToken.deleteMany({
                where: {
                    OR: [
                        { expires_at: { lt: now } },
                        { revoked: true, expires_at: { lt: now } },
                    ],
                },
            });
            const deletedRevokedTokens = await this.prisma.revokedToken.deleteMany({
                where: {
                    expires_at: { lt: now },
                },
            });
            this.logger.log(`Cleaned up ${deletedTokens.count} expired tokens and ${deletedRevokedTokens.count} revoked tokens`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to cleanup tokens: ${errorMessage}`);
        }
    }
};
exports.LogCleanupJobs = LogCleanupJobs;
__decorate([
    (0, schedule_1.Cron)('0 1 * * *', { timeZone: 'Africa/Addis_Ababa' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogCleanupJobs.prototype, "cleanupOldActivityLogs", null);
__decorate([
    (0, schedule_1.Cron)('0 2 * * *', { timeZone: 'Africa/Addis_Ababa' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogCleanupJobs.prototype, "cleanupExpiredTokens", null);
exports.LogCleanupJobs = LogCleanupJobs = LogCleanupJobs_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogCleanupJobs);
//# sourceMappingURL=log-cleanup.jobs.js.map