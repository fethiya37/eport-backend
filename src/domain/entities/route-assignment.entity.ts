// src/domain/entities/route-assignment.entity.ts
export class RouteAssignment {
  constructor(
    public readonly id: number,
    public readonly route_id: number,
    public readonly driver_id: number,
    public readonly vehicle_id: number,
    public readonly association_id: number,
    public readonly start_date: Date,
    public readonly end_date: Date,
    public readonly status: 'Approved' | 'Pending',
    public readonly is_weekly: boolean,
    public readonly assigned_by_user_id: number,
    public readonly approved_by_user_id?: number | null,
    public readonly approved_at?: Date | null,
    public readonly route_quota_id?: number | null,
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}
}
