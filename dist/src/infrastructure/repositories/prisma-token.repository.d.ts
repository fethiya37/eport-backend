import { PrismaService } from '../../../prisma/prisma.service';
import { ITokenRepository } from '../../domain/repositories/token.repository';
export declare class PrismaTokenRepository implements ITokenRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    revoke(jti: string, user_id: number, expires_at: Date): Promise<void>;
    isRevoked(jti: string): Promise<boolean>;
    cleanupExpired(now?: Date): Promise<void>;
}
