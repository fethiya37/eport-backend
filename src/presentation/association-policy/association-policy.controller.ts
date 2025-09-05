import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AssociationPolicyService } from '../../application/services/association-policy.service';
import { UpsertPolicyDto } from './dto/upsert-policy.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';

@ApiTags('association-policy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('association-policy')
export class AssociationPolicyController {
  constructor(private readonly service: AssociationPolicyService) {}

  @Get()
  @Roles('Admin','Superadmin','Association')
  get(@AuthUser() user: UserContext) {
    return this.service.get(user);
  }

  @Post()
  @Roles('Admin','Superadmin','Association')
  upsert(@AuthUser() user: UserContext, @Body() dto: UpsertPolicyDto) {
    return this.service.upsert(user, dto);
  }
}
