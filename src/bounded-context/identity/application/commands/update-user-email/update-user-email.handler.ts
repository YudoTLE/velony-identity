import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { type DomainEvent } from '@shared-kernel/libs/domain-event';

import { UpdateUserEmailCommand } from '@identity-application/commands/update-user-email/update-user-email.command';
import { PersistenceService } from '@identity-application/services/persistence.service';
import { UserNotFoundException } from '@identity-domain/user/exceptions/user-not-found.exception';
import { UserRepository } from '@identity-domain/user/repositories/user.repository';
import { InvalidVerificationTokenException } from '@identity-domain/verification/exceptions/invalid-verification-token.exception';
import { VerificationNotFoundException } from '@identity-domain/verification/exceptions/verification-not-found.exception';
import { EmailVerificationRepository } from '@identity-domain/verification/repositories/email-verification.repository';

@CommandHandler(UpdateUserEmailCommand)
export class UpdateUserEmailHandler implements ICommandHandler<UpdateUserEmailCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: EmailVerificationRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly persistenceService: PersistenceService,
  ) {}

  async execute(command: UpdateUserEmailCommand): Promise<void> {
    const events: DomainEvent[] = [];

    await this.persistenceService.transaction(async () => {
      const verification = await this.verificationRepository.findByUserId(
        command.context.userId,
      );
      if (!verification) {
        throw new VerificationNotFoundException();
      }
      if (!verification.verifyToken(command.props.token)) {
        throw new InvalidVerificationTokenException();
      }

      verification.verify();

      await this.verificationRepository.save(verification);
      events.push(...verification.pullDomainEvents());

      const user = await this.userRepository.findById(command.context.userId);
      if (!user) {
        throw new UserNotFoundException();
      }

      user.updateEmail(verification.value);

      await this.userRepository.save(user);
      events.push(...verification.pullDomainEvents());

      await this.persistenceService.enqueueToOutbox(events);
      for (const event of events) {
        await this.eventEmitter.emitAsync(event.type, event);
      }
    });
  }
}
