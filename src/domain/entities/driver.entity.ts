export type driver_status = 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';

export class Driver {
  constructor(
    public readonly id: number,
    public readonly user_id: number,
    public readonly association_id: number,
    public readonly full_name: string,
    public readonly license_no: string | null,
    public readonly license_expiry: Date | null,
    public readonly phone_number: string,
    public readonly status: driver_status,
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}
}
