export type vehicle_status = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'SUSPENDED' | 'RESIGNED';

export class Vehicle {
  constructor(
    public readonly id: number,
    public readonly plate_number: string,
    public readonly libre_no: string | null,
    public readonly owner_id: number,
    public readonly association_id: number,
    public readonly make: string | null,
    public readonly model: string | null,
    public readonly color: string | null,
    public readonly capacity: number | null,
    public readonly status: vehicle_status,
    public readonly started_at: Date,          // NEW
    public readonly ended_at: Date | null,     // NEW
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
    public readonly deleted_at?: Date | null,
  ) {}
}
