import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ITokenRepository } from '../../domain/repositories/token.repository';

@Injectable()
export class PrismaTokenRepository implements ITokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async revoke(jti: string, user_id: number, expires_at: Date): Promise<void> {
    await this.prisma.revokedToken.create({
      data: { jti, user_id, expires_at },
    });
  }

  async isRevoked(jti: string): Promise<boolean> {
    const row = await this.prisma.revokedToken.findUnique({ where: { jti } });
    return !!row;
  }

  async cleanupExpired(now = new Date()): Promise<void> {
    await this.prisma.revokedToken.deleteMany({
      where: { expires_at: { lt: now } },
    });
  }
}
