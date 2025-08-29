export class VehicleAssignment {
  constructor(
    public readonly id: number,
    public readonly driver_id: number,
    public readonly vehicle_id: number,
    public readonly association_id: number,
    public readonly active: boolean,
    public readonly started_at: Date,
    public readonly ended_at: Date | null,
  ) {}
}
