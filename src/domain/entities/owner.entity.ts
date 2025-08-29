export type owner_status = 'ACTIVE' | 'SUSPENDED';

export class Owner {
  constructor(
    public readonly id: number,
    public readonly user_id: number,
    public readonly association_id: number,
    public readonly full_name: string,
    public readonly phone_number: string,
    public readonly status: owner_status,
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}
}
