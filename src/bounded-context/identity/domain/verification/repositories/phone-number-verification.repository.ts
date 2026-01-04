import { type AggregateId } from '@shared-kernel/libs/entity';

import { type PhoneNumberVerificationEntity } from '@identity-domain/verification/aggregates/phone-number-verification.entity';

export abstract class PhoneNumberVerificationRepository {
  public abstract findByUserId(
    userId: AggregateId,
  ): Promise<PhoneNumberVerificationEntity | null>;

  public abstract save(entity: PhoneNumberVerificationEntity): Promise<void>;
}
