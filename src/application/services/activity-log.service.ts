import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { ACTIVITY_LOG_REPOSITORY } from '../../domain/repositories/activity-log.repository';
import type {
  IActivityLogRepository,
  ActivityLogCreate,
  ActivityLogFilter,
} from '../../domain/repositories/activity-log.repository';
import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';

@Injectable()
export class ActivityLogService {
  constructor(
    @Inject(ACTIVITY_LOG_REPOSITORY)
    private readonly logs: IActivityLogRepository,
  ) {}

  private getUserId(ctx: UserContext | null): number | null {
    if (!ctx) return null;
    return (ctx as any).user_id ?? null;
  }

  async log(
    ctx: UserContext | null,
    input: {
      module: string;
      action: string;
      entity?: string;
      entity_id?: number;
      ip_address?: string | null;
    },
  ): Promise<void> {
    const payload: ActivityLogCreate = {
      user_id: this.getUserId(ctx),
      association_id: ctx?.association_id ?? null,
      action: `${input.module}:${input.action}`,
      entity_type: input.entity ?? null,
      entity_id: input.entity_id ?? null,
      ip_address: input.ip_address ?? null,
    };

    await this.logs.create(payload);
  }

  async findMany(
    ctx: UserContext,
    filter: ActivityLogFilter,
    options?: { skip?: number; take?: number },
  ) {
    const effective: ActivityLogFilter = { ...filter };

    if (!isAdminLike(ctx.user_type)) {
      if (!ctx.association_id) {
        throw new ForbiddenException('Association context required');
      }
      effective.association_id = ctx.association_id;
    }

    return this.logs.findMany(effective, options);
  }

  async findOne(ctx: UserContext, id: number) {
    const log = await this.logs.findById(id);
    if (!log) return null;

    if (!isAdminLike(ctx.user_type)) {
      if (!ctx.association_id || log.association_id !== ctx.association_id) {
        throw new ForbiddenException('Not allowed to view this log');
      }
    }

    return log;
  }
}
