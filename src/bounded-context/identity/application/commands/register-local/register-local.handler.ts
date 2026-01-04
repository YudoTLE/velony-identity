import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { RegisterLocalCommand } from '@identity-application/commands/register-local/register-local.command';
import { TokenService } from '@identity-application/services/token.service';
import { UserEntity } from '@identity-domain/user/aggregates/user.entity';
import { UserRepository } from '@identity-domain/user/repositories/user.command.repository';
import { Name } from '@identity-domain/user/value-objects/name.vo';
import { Password } from '@identity-domain/user/value-objects/password.vo';
import { Username } from '@identity-domain/user/value-objects/username.vo';

@CommandHandler(RegisterLocalCommand)
export class RegisterLocalHandler implements ICommandHandler<RegisterLocalCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: RegisterLocalCommand) {
    const user = await UserEntity.registerLocal({
      name: Name.create(command.props.name),
      username: Username.create(command.props.username),
      password: Password.create(command.props.password),
    });

    await this.userRepository.save(user);

    const domainEvents = user.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventEmitter.emitAsync(event.type, event);
    }
    user.clearDomainEvents();

    const accessToken = this.tokenService.generateAccessToken({ sub: user.id });
    const refreshToken = this.tokenService.generateRefreshToken({
      sub: user.id,
    });

    return { accessToken, refreshToken };
  }
}
