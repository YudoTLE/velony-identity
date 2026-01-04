import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { UpdateUserPhoneNumberCommand } from '@identity-application/commands/update-user-phone-number/update-user-phone-number.command';
import { UserNotFoundException } from '@identity-domain/user/exceptions/user-not-found.exception';
import { UserRepository } from '@identity-domain/user/repositories/user.command.repository';
import { PhoneNumber } from '@identity-domain/user/value-objects/phone-number.vo';

@CommandHandler(UpdateUserPhoneNumberCommand)
export class UpdateUserPhoneNumberHandler implements ICommandHandler<UpdateUserPhoneNumberCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateUserPhoneNumberCommand): Promise<void> {
    const user = await this.userRepository.findById(
      command.context.userId,
    );
    if (!user) {
      throw new UserNotFoundException();
    }

    user.updatePhoneNumber(PhoneNumber.create(command.props.phoneNumber));

    await this.userRepository.save(user);

    const domainEvents = user.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventEmitter.emitAsync(event.type, event);
    }
    user.clearDomainEvents();
  }
}
