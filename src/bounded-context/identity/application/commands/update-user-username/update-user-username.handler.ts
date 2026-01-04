import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { type DomainEvent } from '@shared-kernel/libs/domain-event';

import { UpdateUserUsernameCommand } from '@identity-application/commands/update-user-username/update-user-username.command';
import { PersistenceService } from '@identity-application/services/persistence.service';
import { UserNotFoundException } from '@identity-domain/user/exceptions/user-not-found.exception';
import { UserRepository } from '@identity-domain/user/repositories/user.repository';
import { Username } from '@identity-domain/user/value-objects/username.vo';

@CommandHandler(UpdateUserUsernameCommand)
export class UpdateUserUsernameHandler implements ICommandHandler<UpdateUserUsernameCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly persistenceService: PersistenceService,
  ) {}

  async execute(command: UpdateUserUsernameCommand): Promise<void> {
    const events: DomainEvent[] = [];

    await this.persistenceService.transaction(async () => {
      const user = await this.userRepository.findById(command.context.userId);
      if (!user) {
        throw new UserNotFoundException();
      }

      user.updateUsername(Username.create(command.props.username));

      await this.userRepository.save(user);
      events.push(...user.pullDomainEvents());

      await this.persistenceService.enqueueToOutbox(events);
      for (const event of events) {
        await this.eventEmitter.emitAsync(event.type, event);
      }
    });
  }
}
