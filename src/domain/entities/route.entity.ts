export class Route {
  constructor(
    public readonly id: number,
    public readonly route_group_id: number,
    public readonly departure: string,
    public readonly arrival: string,
    public readonly kilometer: string, // represent Decimal as string in domain
    public readonly tariff: string,    // represent Decimal as string in domain
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}
}
