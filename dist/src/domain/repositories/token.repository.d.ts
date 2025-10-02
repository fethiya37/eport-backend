export declare const TOKEN_REPOSITORY: unique symbol;
export interface ITokenRepository {
    revoke(jti: string, user_id: number, expires_at: Date): Promise<void>;
    isRevoked(jti: string): Promise<boolean>;
    cleanupExpired?(now?: Date): Promise<void>;
}
