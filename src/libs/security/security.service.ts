import { UsersRepository } from '@app/users/repos/users.repository';
import { JwtPayload } from '@common/types/jwt-payload.type';
import { Tokens } from '@common/types/tokens.type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRepo: UsersRepository,
  ) {}
  hashData(password: string): string {
    const hash = crypto.createHash('MD5');
    return hash.update(password).digest('hex');
  }

  async compareData(plainData: string, hashedData: string): Promise<boolean> {
    return (await this.hashData(plainData)) === hashedData;
  }

  async signTokens(userId: string, email: string, role: Role): Promise<Tokens> {
    const jwtPayload: JwtPayload = { sub: userId, email, role };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('security.atSecret'),
        expiresIn: this.configService.get<string>('security.atExpiresIn'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('security.rtSecret'),
        expiresIn: this.configService.get<string>('security.rtExpiresIn'),
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async signMailToken(email: string) {
    const payload = { email };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('email.secret'),
      expiresIn: this.configService.get<string>('email.expiresAt'),
    });
  }

  async updateRtHash(userId: string, refreshToken: string) {
    const hashedRt = await this.hashData(refreshToken);
    await this.userRepo.updateRtHash(userId, hashedRt);
  }
}
