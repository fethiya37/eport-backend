import { Inject, Injectable } from '@nestjs/common';
import {
    VEHICLE_ASSIGNMENT_REPOSITORY,
    VehicleAssignmentFilter,
} from '../../domain/repositories/vehicle-assignment.repository';
import type {
    IVehicleAssignmentRepository,
} from '../../domain/repositories/vehicle-assignment.repository';
import type { UserContext } from 'src/common/context/user-context';

@Injectable()
export class VehicleAssignmentService {
    constructor(
        @Inject(VEHICLE_ASSIGNMENT_REPOSITORY) private readonly repo: IVehicleAssignmentRepository,
    ) { }

    list(ctx: UserContext, f: VehicleAssignmentFilter) {
        return this.repo.search(ctx, f);
    }
}
