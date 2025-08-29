export type association_status = 'ACTIVE' | 'SUSPENDED';

export class Association {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly phone_number: string | null, // 👈 add here
    public readonly logo: string | null,
    public readonly status: association_status,
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}
}
