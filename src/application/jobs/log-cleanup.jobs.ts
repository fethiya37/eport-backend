import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LogCleanupJobs {
  private readonly logger = new Logger(LogCleanupJobs.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 1 * * *', { timeZone: 'Africa/Addis_Ababa' })
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

      this.logger.log(
        `Cleaned up ${deleted.count} activity logs older than 30 days`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup activity logs: ${errorMessage}`);
    }
  }

  @Cron('0 2 * * *', { timeZone: 'Africa/Addis_Ababa' })
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

      this.logger.log(
        `Cleaned up ${deletedTokens.count} expired tokens and ${deletedRevokedTokens.count} revoked tokens`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup tokens: ${errorMessage}`);
    }
  }
}
