import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChapaApiService } from '../../infrastructure/payments/chapa-api.service';
import {
  type IAssociationSubaccountRepository,
  ASSOCIATION_SUBACCOUNT_REPOSITORY,
} from '../../domain/repositories/association-subaccount.repository';
import type { UserContext } from '../../common/context/user-context';
import { isAdminLike } from '../../common/auth/roles.util';
import { ActivityLogService } from '../services/activity-log.service';

@Injectable()
export class AssociationSubaccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chapa: ChapaApiService,
    @Inject(ASSOCIATION_SUBACCOUNT_REPOSITORY)
    private readonly repo: IAssociationSubaccountRepository,
    private readonly activityLog: ActivityLogService,
  ) { }

  private resolveAssociationId(ctx: UserContext, association_id?: number) {
    if (isAdminLike(ctx.user_type)) {
      if (!association_id)
        throw new BadRequestException('association_id is required for admin/superadmin');
      return association_id;
    }
    if (!ctx.association_id) throw new ForbiddenException('association context missing');
    return ctx.association_id;
  }

  async createForAssociation(
    ctx: UserContext,
    dto: {
      bank_code: number;
      account_number: string;
      account_name: string;
      business_name: string;
      split_type?: 'fixed' | 'percentage';
      split_value?: number;
    },
    association_id?: number,
  ) {
    const assocId = this.resolveAssociationId(ctx, association_id);

    const assoc = await this.prisma.association.findUnique({ where: { id: assocId } });
    if (!assoc) throw new BadRequestException('association not found');

    const existing = await this.repo.findByAssociationId(ctx, assocId);
    if (existing) throw new BadRequestException('subaccount already exists for this association');

    const chapaResp = await this.chapa.createSubaccount({
      bank_code: dto.bank_code,
      account_number: dto.account_number,
      account_name: dto.account_name,
      business_name: dto.business_name,
      split_type: dto.split_type ?? 'percentage',
      split_value: dto.split_value ?? 1,
    });

    const chapaId =
      chapaResp?.data?.id || chapaResp?.data?.subaccount_id || chapaResp?.subaccount_id;
    if (!chapaId) throw new BadRequestException('invalid chapa response (no subaccount id)');

    const sub = await this.repo.create(ctx, {
      association_id: assocId,
      chapa_id: String(chapaId),
      business_name: dto.business_name,
      account_name: dto.account_name,
      account_number: dto.account_number,
    });

    await this.activityLog.log(ctx, {
      module: 'AssociationSubaccount',
      action: 'CREATE',
      entity: 'AssociationSubaccount',
      entity_id: sub.id,
    });

    return sub;
  }

  async getMine(ctx: UserContext, association_id?: number) {
    const assocId = this.resolveAssociationId(ctx, association_id);
    const row = await this.repo.findByAssociationId(ctx, assocId);
    if (!row) throw new NotFoundException('subaccount not found');
    return row;
  }

  async hardDelete(ctx: UserContext, id: number) {
    await this.repo.hardDelete(ctx, id);

    await this.activityLog.log(ctx, {
      module: 'AssociationSubaccount',
      action: 'DELETE',
      entity: 'AssociationSubaccount',
      entity_id: id,
    });

    return { status: 'ok' };
  }
}
