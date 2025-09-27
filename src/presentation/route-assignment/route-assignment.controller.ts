import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';

import { RouteAssignmentService } from '../../application/services/route-assignment.service';
import { BulkUpsertAssignmentsDto } from './dto/bulk-upsert.dto';
import { ApproveAssignmentsDto } from './dto/approve.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { RouteAssignmentFilterDto } from './dto/find-filter.dto';
import { VisibleCoverageQueryDto } from './dto/visible-coverage.dto';

@ApiTags('route-assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('route-assignments')
export class RouteAssignmentController {
  constructor(private readonly service: RouteAssignmentService) { }

  @Post('bulk-upsert')
  @Roles('Admin', 'Superadmin', 'Association')
  @ApiOperation({ summary: 'Create/update many assignments (GC only)' })
  bulkUpsert(@AuthUser() user: UserContext, @Body() dto: BulkUpsertAssignmentsDto) {
    return this.service.bulkUpsert(user, dto);
  }

  @Patch('approve')
  @Roles('Admin', 'Superadmin')
  @ApiOperation({ summary: 'Approve many assignments' })
  approve(@AuthUser() user: UserContext, @Body() dto: ApproveAssignmentsDto) {
    return this.service.approve(user, dto);
  }

  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  @ApiOperation({ summary: 'List assignments (GC filters)' })
  find(@AuthUser() user: UserContext, @Query() filter: RouteAssignmentFilterDto) {
    return this.service.find(user, filter);
  }

  @Patch(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  @ApiOperation({ summary: 'Update one assignment (GC only)' })
  updateOne(
    @AuthUser() user: UserContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.service.updateOne(user, id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'Superadmin', 'Association')
  @ApiOperation({ summary: 'Delete one assignment' })
  remove(@AuthUser() user: UserContext, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(user, id);
  }

  @Get('visible-coverage')
  @Roles('Driver', 'Controller')
  @ApiOperation({
    summary:
      'View route assignments from current period start → active_until_date (Approved only), GC in/out, by plate_number or driver_id',
  })
  visibleCoverage(@AuthUser() user: UserContext, @Query() q: VisibleCoverageQueryDto) {
    return this.service.visibleCoverage(user, q);
  }
}
