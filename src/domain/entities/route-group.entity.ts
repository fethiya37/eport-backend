export class RouteGroup {
  constructor(
    public readonly id: number,
    public readonly route_group: string,
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}
}
