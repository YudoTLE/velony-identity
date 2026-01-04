import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { type DomainEvent } from '@shared-kernel/libs/domain-event';

import { UpdateUserPasswordCommand } from '@identity-application/commands/update-user-password/update-user-password.command';
import { PersistenceService } from '@identity-application/services/persistence.service';
import { UserNotFoundException } from '@identity-domain/user/exceptions/user-not-found.exception';
import { UserRepository } from '@identity-domain/user/repositories/user.repository';
import { Password } from '@identity-domain/user/value-objects/password.vo';

@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordHandler implements ICommandHandler<UpdateUserPasswordCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly persistenceService: PersistenceService,
  ) {}

  async execute(command: UpdateUserPasswordCommand): Promise<void> {
    const events: DomainEvent[] = [];

    await this.persistenceService.transaction(async () => {
      const user = await this.userRepository.findById(command.context.userId);
      if (!user) {
        throw new UserNotFoundException();
      }

      user.updateLocalAuthentication(
        Password.create(command.props.currentPassword),
        Password.create(command.props.password),
      );

      await this.userRepository.save(user);
      events.push(...user.pullDomainEvents());

      await this.persistenceService.enqueueToOutbox(events);
      for (const event of events) {
        await this.eventEmitter.emitAsync(event.type, event);
      }
    });
  }
}
