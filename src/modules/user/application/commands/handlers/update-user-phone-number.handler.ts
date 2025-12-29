import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserNotFoundException } from 'src/modules/user/domain/exceptions/user-not-found.exception';
import { UserCommandRepository } from 'src/modules/user/domain/repositories/user.command.repository';
import { PhoneNumber } from 'src/modules/user/domain/value-objects/phone-number.vo';

import { UpdateUserPhoneNumberCommand } from '../update-user-phone-number.command';

@CommandHandler(UpdateUserPhoneNumberCommand)
export class UpdateUserPhoneNumberHandler implements ICommandHandler<UpdateUserPhoneNumberCommand> {
  constructor(
    private readonly userCommandRepository: UserCommandRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateUserPhoneNumberCommand): Promise<void> {
    const user = await this.userCommandRepository.findById(
      command.context.userId,
    );
    if (!user) {
      throw new UserNotFoundException();
    }

    user.updatePhoneNumber(PhoneNumber.create(command.props.phoneNumber));

    await this.userCommandRepository.save(user);

    const domainEvents = user.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventEmitter.emitAsync(event.type, event, {
        userId: command.context.userId,
        correlationId: command.id,
      });
    }
    user.clearDomainEvents();
  }
}
