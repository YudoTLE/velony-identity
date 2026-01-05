import { Injectable } from '@nestjs/common';
import { convertTime } from '@velony/utils';
import { type Request, type Response } from 'express';

import { TypedConfigService } from '@config/typed-config.service';

import { MissingAccessTokenException } from '@common/exceptions/missing-access-token.exception';
import { MissingRefreshTokenException } from '@common/exceptions/missing-refresh-token.exception';
import { CookieService } from '@common/services/cookie.service';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

@Injectable()
export class CookieAuthService {
  constructor(
    private readonly configService: TypedConfigService,
    private readonly cookieService: CookieService,
  ) {}

  setAccessToken(response: Response, accessToken: string): void {
    const accessTokenExpiration = this.configService.get(
      'JWT_ACCESS_EXPIRATION',
    );

    this.cookieService.set(response, ACCESS_TOKEN_COOKIE, accessToken, {
      maxAge: convertTime(accessTokenExpiration).milliseconds,
    });
  }

  setRefreshToken(response: Response, refreshToken: string): void {
    const refreshTokenExpiration = this.configService.get(
      'JWT_REFRESH_EXPIRATION',
    );

    this.cookieService.set(response, REFRESH_TOKEN_COOKIE, refreshToken, {
      maxAge: convertTime(refreshTokenExpiration).milliseconds,
    });
  }

  removeAccessToken(response: Response): void {
    this.cookieService.clear(response, [ACCESS_TOKEN_COOKIE]);
  }
  removeRefreshToken(response: Response): void {
    this.cookieService.clear(response, [REFRESH_TOKEN_COOKIE]);
  }

  clear(response: Response): void {
    this.cookieService.clear(response, [
      ACCESS_TOKEN_COOKIE,
      REFRESH_TOKEN_COOKIE,
    ]);
  }

  getAccessToken(request: Request): string {
    // eslint-disable-next-line security/detect-object-injection
    const accessToken = request.cookies[ACCESS_TOKEN_COOKIE];
    if (accessToken === undefined) {
      throw new MissingAccessTokenException();
    }
    return accessToken;
  }

  getRefreshToken(request: Request): string {
    // eslint-disable-next-line security/detect-object-injection
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];
    if (refreshToken === undefined) {
      throw new MissingRefreshTokenException();
    }
    return refreshToken;
  }
}
