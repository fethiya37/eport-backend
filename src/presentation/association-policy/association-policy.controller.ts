import { Controller, Get, Post, UseGuards, Body, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';
import { AssociationPolicyService } from '../../application/services/association-policy.service';
import { UpsertPolicyDto } from './dto/upsert-policy.dto';

@ApiTags('association-policy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AssociationContextGuard) // <- require association context for all routes
@Controller('association-policy')
export class AssociationPolicyController {
  constructor(private readonly service: AssociationPolicyService) {}

  // ✅ Allow every signed-in role used by the mobile app to READ
  @Get()
  @Roles('Admin','Superadmin','Association','Driver','Controller')
  get(@AuthUser() user: UserContext) {
    return this.service.get(user);
  }

  // Keep UPSERT limited
  @Post()
  @Roles('Admin','Superadmin','Association')
  upsert(@AuthUser() user: UserContext, @Body() dto: UpsertPolicyDto) {
    return this.service.upsert(user, dto);
  }
}
