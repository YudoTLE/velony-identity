import { randomInt } from 'crypto';

import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { type DomainEvent } from '@shared-kernel/libs/domain-event';

import { IssueEmailChangeCommand } from '@identity-application/commands/issue-email-change/issue-email-change.command';
import { PersistenceService } from '@identity-application/services/persistence.service';
import { Email } from '@identity-domain/user/value-objects/email.vo';
import { EmailVerificationEntity } from '@identity-domain/verification/aggregates/email-verification.entity';
import { EmailVerificationRepository } from '@identity-domain/verification/repositories/email-verification.repository';

@CommandHandler(IssueEmailChangeCommand)
export class IssueEmailChangeHandler implements ICommandHandler<IssueEmailChangeCommand> {
  constructor(
    private readonly verificationRepository: EmailVerificationRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly persistenceService: PersistenceService,
  ) {}

  async execute(command: IssueEmailChangeCommand): Promise<void> {
    const events: DomainEvent[] = [];

    await this.persistenceService.transaction(async () => {
      const activeVerification = await this.verificationRepository.findByUserId(
        command.context.userId,
      );
      if (activeVerification) {
        activeVerification.revoke();

        await this.verificationRepository.save(activeVerification);
        events.push(...activeVerification.pullDomainEvents());
      }

      const verification = EmailVerificationEntity.create({
        userId: command.props.userId,
        token: this.generateOTP(),
        value: Email.create(command.props.email),
        ttl: command.props.ttl,
      });

      await this.verificationRepository.save(verification);
      events.push(...verification.pullDomainEvents());

      for (const event of events) {
        await this.eventEmitter.emitAsync(event.type, event);
      }
    });
  }

  private generateOTP(): string {
    const otp = randomInt(0, 1000000);
    return otp.toString().padStart(6, '0');
  }
}
