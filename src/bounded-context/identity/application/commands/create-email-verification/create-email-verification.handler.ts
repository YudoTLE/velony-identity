import { randomInt } from 'crypto';

import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CreateEmailVerificationCommand } from '@identity-application/commands/create-email-verification/create-email-verification.command';
import { Email } from '@identity-domain/user/value-objects/email.vo';
import { EmailVerificationEntity } from '@identity-domain/verification/aggregates/email-verification.entity';
import { VerificationRepository } from '@identity-domain/verification/repositories/verification.repository';

@CommandHandler(CreateEmailVerificationCommand)
export class CreateEmailVerificationHandler implements ICommandHandler<CreateEmailVerificationCommand> {
  constructor(
    private readonly verificationRepository: VerificationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // TODO: Wrap revoke + create in a transaction to ensure atomicity
  async execute(command: CreateEmailVerificationCommand): Promise<void> {
    const activeVerification =
      await this.verificationRepository.findByUserId(
        command.context.userId,
        'email',
      );
    if (activeVerification) {
      activeVerification.revoke();
      await this.verificationRepository.save(activeVerification);
    }

    const verification = EmailVerificationEntity.create({
      userId: command.props.userId,
      token: this.generateOTP(),
      value: Email.create(command.props.email),
      ttl: command.props.ttl,
    });
    await this.verificationRepository.save(verification);

    const domainEvents = verification.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventEmitter.emitAsync(event.type, event);
    }
    verification.clearDomainEvents();
  }

  private generateOTP(): string {
    const otp = randomInt(0, 1000000);
    return otp.toString().padStart(6, '0');
  }
}
