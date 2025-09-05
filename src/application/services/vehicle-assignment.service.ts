import { Inject, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  VEHICLE_ASSIGNMENT_REPOSITORY,
  VehicleAssignmentFilter,
} from '../../domain/repositories/vehicle-assignment.repository';
import type { IVehicleAssignmentRepository } from '../../domain/repositories/vehicle-assignment.repository';
import type { UserContext } from 'src/common/context/user-context';

@Injectable()
export class VehicleAssignmentService {
  constructor(
    @Inject(VEHICLE_ASSIGNMENT_REPOSITORY) private readonly repo: IVehicleAssignmentRepository,
  ) {}

  list(ctx: UserContext, f: VehicleAssignmentFilter) {
    return this.repo.search(ctx, f);
  }

  /**
   * Deactivate the current active assignment for a driver (active:true → false).
   * Association users only (enforced at controller via Roles guard).
   */
  async deactivateActive(ctx: UserContext, driver_id: number) {
    if (!driver_id || driver_id <= 0) {
      throw new BadRequestException('driver_id is required');
    }
    // closeActiveForDriver returns number of updated rows
    const closed = await this.repo.closeActiveForDriver(ctx, driver_id, new Date());
    return { closed };
  }
}
