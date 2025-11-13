import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from '../../application/services/activity-log.service';
import { ACTIVITY_LOG_REPOSITORY } from '../../domain/repositories/activity-log.repository';
import { PrismaActivityLogRepository } from '../../infrastructure/repositories/prisma-activity-log.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityLogController],
  providers: [
    ActivityLogService,
    {
      provide: ACTIVITY_LOG_REPOSITORY,
      useClass: PrismaActivityLogRepository,
    },
  ],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
