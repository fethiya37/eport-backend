export type vehicle_association_status = 'ACTIVE' | 'SUSPENDED' | 'RESIGNED';

export class VehicleAssociation {
  constructor(
    public readonly id: number,
    public readonly association_id: number,
    public readonly vehicle_id: number,
    public readonly started_at: Date,
    public readonly ended_at: Date | null,
    public readonly status: vehicle_association_status,
  ) {}
}
