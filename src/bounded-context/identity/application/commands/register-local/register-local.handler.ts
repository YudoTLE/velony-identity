import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { type DomainEvent } from '@shared-kernel/libs/domain-event';

import { RegisterLocalCommand } from '@identity-application/commands/register-local/register-local.command';
import { PersistenceService } from '@identity-application/services/persistence.service';
import { TokenService } from '@identity-application/services/token.service';
import { UserEntity } from '@identity-domain/user/aggregates/user.entity';
import { UserRepository } from '@identity-domain/user/repositories/user.repository';
import { Name } from '@identity-domain/user/value-objects/name.vo';
import { Password } from '@identity-domain/user/value-objects/password.vo';
import { Username } from '@identity-domain/user/value-objects/username.vo';

@CommandHandler(RegisterLocalCommand)
export class RegisterLocalHandler implements ICommandHandler<RegisterLocalCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly persistenceService: PersistenceService,
  ) {}

  async execute(command: RegisterLocalCommand) {
    const user = await UserEntity.registerLocal({
      name: Name.create(command.props.name),
      username: Username.create(command.props.username),
      password: Password.create(command.props.password),
    });

    const events: DomainEvent[] = [];

    await this.persistenceService.transaction(async () => {
      await this.userRepository.save(user);
      events.push(...user.pullDomainEvents());

      await this.persistenceService.enqueueToOutbox(events);
      for (const event of events) {
        await this.eventEmitter.emitAsync(event.type, event);
      }
    });

    const accessToken = this.tokenService.generateAccessToken({ sub: user.id });
    const refreshToken = this.tokenService.generateRefreshToken({
      sub: user.id,
    });

    return { accessToken, refreshToken };
  }
}
