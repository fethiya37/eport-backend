import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { type IAssociationPolicyRepository, ASSOCIATION_POLICY_REPOSITORY } from '../../domain/repositories/association-policy.repository';
import type { UserContext } from 'src/common/context/user-context';
import { isAdminLike } from '../../common/auth/roles.util';

@Injectable()
export class AssociationPolicyService {
  constructor(
    @Inject(ASSOCIATION_POLICY_REPOSITORY) private readonly repo: IAssociationPolicyRepository,
  ) {}

  async upsert(ctx: UserContext, dto: { weekly_fee: number; monthly_fee: number; daily_fine_percent: number }) {
    if (!ctx.association_id) throw new BadRequestException('association_id required');
    if (!isAdminLike(ctx.user_type) && ctx.user_type !== 'Association') {
      throw new BadRequestException('Only Association/Admin can set policy');
    }
    return this.repo.upsert({
      association_id: ctx.association_id,
      ...dto,
    });
  }

  get(ctx: UserContext) {
    if (!ctx.association_id) throw new BadRequestException('association_id required');
    return this.repo.get(ctx.association_id);
  }
}
