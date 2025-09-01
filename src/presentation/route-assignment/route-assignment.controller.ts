import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RouteAssignmentService } from '../../application/services/route-assignment.service';
import { BulkUpsertAssignmentsDto } from './dto/bulk-upsert.dto';
import { ApproveAssignmentsDto } from './dto/approve.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';

@ApiTags('route-assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('route-assignments')
export class RouteAssignmentController {
  constructor(private readonly service: RouteAssignmentService) {}

  // Admin/Superadmin create directly; Association users create Pending (quota-checked)
  @Post('bulk-upsert')
  @Roles('Admin', 'Superadmin', 'Association')
  bulkUpsert(@AuthUser() user: UserContext, @Body() dto: BulkUpsertAssignmentsDto) {
    return this.service.bulkUpsert(user, dto);
  }

  // Approve pending (Admin/Superadmin only)
  @Patch('approve')
  @Roles('Admin', 'Superadmin')
  approve(@AuthUser() user: UserContext, @Body() dto: ApproveAssignmentsDto) {
    return this.service.approve(user, dto);
  }
}
