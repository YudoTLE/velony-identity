import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { LoginLocalCommand } from '@identity-application/commands/login-local/login-local.command';
import { InvalidUsernameOrPasswordException } from '@identity-application/exceptions/invalid-username-or-password.exception';
import { TokenService } from '@identity-application/services/token.service';
import { UserRepository } from '@identity-domain/user/repositories/user.command.repository';
import { Password } from '@identity-domain/user/value-objects/password.vo';
import { Username } from '@identity-domain/user/value-objects/username.vo';

@CommandHandler(LoginLocalCommand)
export class LoginLocalHandler implements ICommandHandler<LoginLocalCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginLocalCommand) {
    const user = await this.userRepository.findByUsername(
      Username.create(command.props.username),
    );
    if (!user) {
      throw new InvalidUsernameOrPasswordException();
    }

    const passwordVerified = await user.authentication.local?.verifyPassword(
      Password.create(command.props.password),
    );
    if (!passwordVerified) {
      throw new InvalidUsernameOrPasswordException();
    }

    const accessToken = this.tokenService.generateAccessToken({ sub: user.id });
    const refreshToken = this.tokenService.generateRefreshToken({
      sub: user.id,
    });

    return { accessToken, refreshToken };
  }
}
