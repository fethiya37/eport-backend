import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';
import { ActivityLogService } from '../../application/services/activity-log.service';
import { LogFilterDto } from './dto/log-filter.dto';
import { LogResponseDto } from './dto/log-response.dto';

@ApiTags('activity-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AssociationContextGuard)
@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  async findMany(
    @AuthUser() user: UserContext,
    @Query() query: LogFilterDto,
  ): Promise<LogResponseDto[]> {
    const { skip, take, date_from, date_to, ...rest } = query;

    const filter = {
      ...rest,
      ...(date_from ? { date_from: new Date(date_from) } : {}),
      ...(date_to ? { date_to: new Date(date_to) } : {}),
    };

    const logs = await this.service.findMany(user, filter, { skip, take });

    return logs.map((l: any) => ({
      id: l.id,
      user_id: l.user_id,
      user_name: l.user?.name ?? null,
      user_phone_number: l.user?.phone_number ?? null,
      user_type: l.user?.user_type ?? null,
      association_id: l.association_id,
      association_name: l.association?.name ?? null,
      action: l.action,
      entity_type: l.entity_type ?? null,
      entity_id: l.entity_id ?? null,
      description: l.description ?? null,
      ip_address: l.ip_address ?? null,
      created_at: l.created_at,
    }));
  }

  @Get(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  async findOne(
    @AuthUser() user: UserContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LogResponseDto | null> {
    const l: any = await this.service.findOne(user, id);
    if (!l) return null;

    return {
      id: l.id,
      user_id: l.user_id,
      user_name: l.user?.name ?? null,
      user_phone_number: l.user?.phone_number ?? null,
      user_type: l.user?.user_type ?? null,
      association_id: l.association_id,
      association_name: l.association?.name ?? null,
      action: l.action,
      entity_type: l.entity_type ?? null,
      entity_id: l.entity_id ?? null,
      ip_address: l.ip_address ?? null,
      created_at: l.created_at,
    };
  }
}
