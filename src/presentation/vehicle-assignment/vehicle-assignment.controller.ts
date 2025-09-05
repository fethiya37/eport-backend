import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import type { UserContext } from 'src/common/context/user-context';
import { VehicleAssignmentFilterDto } from './dto/assignment-filter.dto';
import { parseDateParam } from '../../common/utils/date-range.util';
import { VehicleAssignmentService } from 'src/application/services/vehicle-assignment.service';
import { DeactivateActiveDto } from './dto/deactivate-active.dto';

@ApiTags('vehicle-assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AssociationContextGuard)
@Controller('vehicle-assignments')
export class VehicleAssignmentController {
  constructor(private readonly service: VehicleAssignmentService) {}

  @Get()
  @Roles('Admin', 'Superadmin', 'Association')
  list(@AuthUser() user: UserContext, @Query() q: VehicleAssignmentFilterDto) {
    const filter = {
      driver_id: q.driver_id,
      vehicle_id: q.vehicle_id,
      active: typeof q.active === 'string' ? q.active === 'true' : undefined,
      range_start: parseDateParam(q.range_start, 'from'), // inclusive 00:00 (+03:00)
      range_end:   parseDateParam(q.range_end, 'to'),     // inclusive 23:59:59.999 (+03:00)
    };
    return this.service.list(user, filter);
  }

  @Patch('deactivate-active')
  @Roles('Association')
  @ApiOperation({ summary: 'Deactivate the current active driver–vehicle assignment for a driver' })
  deactivateActive(@AuthUser() user: UserContext, @Body() body: DeactivateActiveDto) {
    return this.service.deactivateActive(user, body.driver_id);
  }
}
