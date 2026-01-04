import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { type DomainEvent } from '@shared-kernel/libs/domain-event';
import { StoragePath } from '@shared-kernel/value-objects/storage-path.vo';

import { UpdateUserAvatarPathCommand } from '@identity-application/commands/update-user-avatar-path/update-user-avatar-path.command';
import { PersistenceService } from '@identity-application/services/persistence.service';
import { UserNotFoundException } from '@identity-domain/user/exceptions/user-not-found.exception';
import { UserRepository } from '@identity-domain/user/repositories/user.repository';

@CommandHandler(UpdateUserAvatarPathCommand)
export class UpdateUserAvatarPathHandler implements ICommandHandler<UpdateUserAvatarPathCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly persistenceService: PersistenceService,
  ) {}

  async execute(command: UpdateUserAvatarPathCommand): Promise<void> {
    const events: DomainEvent[] = [];

    await this.persistenceService.transaction(async () => {
      const user = await this.userRepository.findById(command.context.userId);
      if (!user) {
        throw new UserNotFoundException();
      }

      user.updateAvatarPath(StoragePath.create(command.props.avatarPath));

      await this.userRepository.save(user);
      events.push(...user.pullDomainEvents());

      await this.persistenceService.enqueueToOutbox(events);
      for (const event of events) {
        await this.eventEmitter.emitAsync(event.type, event);
      }
    });
  }
}
