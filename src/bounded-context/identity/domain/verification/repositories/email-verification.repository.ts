import { type AggregateId } from '@shared-kernel/libs/entity';

import { type EmailVerificationEntity } from '@identity-domain/verification/aggregates/email-verification.entity';

export abstract class EmailVerificationRepository {
  public abstract findByUserId(
    userId: AggregateId,
  ): Promise<EmailVerificationEntity | null>;

  public abstract save(entity: EmailVerificationEntity): Promise<void>;
}
