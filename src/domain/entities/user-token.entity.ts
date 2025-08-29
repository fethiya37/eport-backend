export class UserToken {
  constructor(
    public readonly id: number,
    public readonly user_id: number,
    public readonly token_hash: string,
    public readonly expires_at: Date,
    public revoked: boolean,
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}

  isExpired(at: Date = new Date()): boolean {
    return at > this.expires_at;
  }

  revoke(): void {
    this.revoked = true;
  }
}
