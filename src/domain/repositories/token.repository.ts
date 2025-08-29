export const TOKEN_REPOSITORY = Symbol('TOKEN_REPOSITORY');

export interface ITokenRepository {
  revoke(jti: string, user_id: number, expires_at: Date): Promise<void>;
  isRevoked(jti: string): Promise<boolean>;
  cleanupExpired?(now?: Date): Promise<void>;
}
