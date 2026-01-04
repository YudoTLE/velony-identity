import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { VerifyEmailVerificationCommand } from '@identity-application/commands/verify-email-verification/verify-email-verification.command';
import { InvalidVerificationTokenException } from '@identity-domain/verification/exceptions/invalid-verification-token.exception';
import { VerificationNotFoundException } from '@identity-domain/verification/exceptions/verification-not-found.exception';
import { VerificationRepository } from '@identity-domain/verification/repositories/verification.repository';

@CommandHandler(VerifyEmailVerificationCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailVerificationCommand> {
  constructor(
    private readonly verificationRepository: VerificationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: VerifyEmailVerificationCommand): Promise<void> {
    const verification = await this.verificationRepository.findByUserId(
      command.context.userId,
      'email',
    );
    if (!verification) {
      throw new VerificationNotFoundException();
    }

    if (!verification.verifyToken(command.props.token)) {
      throw new InvalidVerificationTokenException();
    }

    verification.verify();

    await this.verificationRepository.save(verification);

    const domainEvents = verification.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventEmitter.emitAsync(event.type, event);
    }
    verification.clearDomainEvents();
  }
}
