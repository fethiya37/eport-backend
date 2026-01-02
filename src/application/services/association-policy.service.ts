import { Inject, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  type IAssociationPolicyRepository,
  ASSOCIATION_POLICY_REPOSITORY,
} from '../../domain/repositories/association-policy.repository';
import type { UserContext } from 'src/common/context/user-context';
import { isAdminLike } from '../../common/auth/roles.util';
import { ActivityLogService } from './activity-log.service';

@Injectable()
export class AssociationPolicyService {
  constructor(
    @Inject(ASSOCIATION_POLICY_REPOSITORY)
    private readonly repo: IAssociationPolicyRepository,
    private readonly activityLog: ActivityLogService,
  ) {}

  private assertPolicyInput(dto: {
    weekly_fee: number;
    monthly_fee: number;
    daily_fine_percent: number;
  }) {
    if (!Number.isFinite(dto.weekly_fee) || dto.weekly_fee < 0) {
      throw new BadRequestException('weekly_fee must be a non-negative number');
    }
    if (!Number.isFinite(dto.monthly_fee) || dto.monthly_fee < 0) {
      throw new BadRequestException('monthly_fee must be a non-negative number');
    }
    if (!Number.isFinite(dto.daily_fine_percent) || dto.daily_fine_percent < 0 || dto.daily_fine_percent > 1) {
      throw new BadRequestException('daily_fine_percent must be between 0 and 1');
    }
  }

  async upsert(
    ctx: UserContext,
    dto: { weekly_fee: number; monthly_fee: number; daily_fine_percent: number },
  ) {
    if (!ctx.association_id) throw new BadRequestException('association_id required');

    if (!isAdminLike(ctx.user_type) && ctx.user_type !== 'Association') {
      throw new ForbiddenException('Only Association/Admin can set policy');
    }

    this.assertPolicyInput(dto);

    const policy = await this.repo.upsert({
      association_id: ctx.association_id,
      weekly_fee: dto.weekly_fee,
      monthly_fee: dto.monthly_fee,
      daily_fine_percent: dto.daily_fine_percent,
    });

    await this.activityLog.log(ctx, {
      module: 'AssociationPolicy',
      action: 'UPSERT',
      entity: 'AssociationPolicy',
      entity_id: policy.association_id,
    });

    return policy;
  }

  async get(ctx: UserContext) {
    if (!ctx.association_id) throw new BadRequestException('association_id required');
    return this.repo.get(ctx.association_id);
  }
}
