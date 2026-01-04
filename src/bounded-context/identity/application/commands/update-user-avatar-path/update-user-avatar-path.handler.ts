import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { StoragePath } from '@shared-kernel/value-objects/storage-path.vo';

import { UpdateUserAvatarPathCommand } from '@identity-application/commands/update-user-avatar-path/update-user-avatar-path.command';
import { UserNotFoundException } from '@identity-domain/user/exceptions/user-not-found.exception';
import { UserRepository } from '@identity-domain/user/repositories/user.command.repository';

@CommandHandler(UpdateUserAvatarPathCommand)
export class UpdateUserAvatarPathHandler implements ICommandHandler<UpdateUserAvatarPathCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateUserAvatarPathCommand): Promise<void> {
    const user = await this.userRepository.findById(
      command.context.userId,
    );
    if (!user) {
      throw new UserNotFoundException();
    }

    user.updateAvatarPath(StoragePath.create(command.props.avatarPath));

    await this.userRepository.save(user);

    const domainEvents = user.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventEmitter.emitAsync(event.type, event);
    }
    user.clearDomainEvents();
  }
}
