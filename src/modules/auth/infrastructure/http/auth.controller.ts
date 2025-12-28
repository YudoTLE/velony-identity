import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { type Response, type Request } from 'express';

import { LoginLocalDto } from './dtos/login-local.dto';
import { RegisterLocalDto } from './dtos/register-local.dto';
import { LoginLocalCommand } from '../../application/commands/login-local.command';
import { RefreshTokenCommand } from '../../application/commands/refresh-token.command';
import { RegisterLocalCommand } from '../../application/commands/register-local.command';
import { CookieAuthService } from '../services/cookie-auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly cookieAuthService: CookieAuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginLocal(
    @Body() dto: LoginLocalDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const command = new LoginLocalCommand({
      username: dto.username,
      password: dto.password,
    });
    const { accessToken, refreshToken } =
      await this.commandBus.execute(command);

    this.cookieAuthService.setAccessToken(response, accessToken);
    this.cookieAuthService.setRefreshToken(response, refreshToken);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerLocal(
    @Body() dto: RegisterLocalDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const command = new RegisterLocalCommand({
      name: dto.name,
      username: dto.username,
      password: dto.password,
    });
    const { accessToken, refreshToken } =
      await this.commandBus.execute(command);

    this.cookieAuthService.setAccessToken(response, accessToken);
    this.cookieAuthService.setRefreshToken(response, refreshToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = this.cookieAuthService.getRefreshToken(request);

    const command = new RefreshTokenCommand({ refreshToken });
    const { accessToken } = await this.commandBus.execute(command);

    this.cookieAuthService.setAccessToken(response, accessToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    this.cookieAuthService.clear(response);
  }
}
