import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { convertTime } from '@velony/utils';

import { TypedConfigService } from '@config/typed-config.service';

import { ExpiredAccessTokenException } from '@common/exceptions/expired-access-token.exception';
import { ExpiredRefreshTokenException } from '@common/exceptions/expired-refresh-token.exception';
import { InvalidAccessTokenException } from '@common/exceptions/invalid-access-token.exception';
import { InvalidRefreshTokenException } from '@common/exceptions/invalid-refresh-token.exception';

import {
  type AccessTokenPayload,
  type RefreshTokenPayload,
  TokenService,
} from '@identity-application/services/token.service';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly configService: TypedConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateAccessToken(payload: AccessTokenPayload): string {
    const expiration = this.configService.get('JWT_ACCESS_EXPIRATION');
    const secret = this.configService.get('JWT_ACCESS_SECRET');

    return this.jwtService.sign(payload, {
      expiresIn: convertTime(expiration).seconds,
      secret: secret,
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    const expiration = this.configService.get('JWT_REFRESH_EXPIRATION');
    const secret = this.configService.get('JWT_REFRESH_SECRET');

    return this.jwtService.sign(payload, {
      expiresIn: convertTime(expiration).seconds,
      secret: secret,
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const secret = this.configService.get('JWT_ACCESS_SECRET');

    try {
      return this.jwtService.verify(token, {
        secret: secret,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ExpiredAccessTokenException();
      }
      throw new InvalidAccessTokenException();
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    const secret = this.configService.get('JWT_REFRESH_SECRET');

    try {
      return this.jwtService.verify(token, {
        secret: secret,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ExpiredRefreshTokenException();
      }
      throw new InvalidRefreshTokenException();
    }
  }
}
