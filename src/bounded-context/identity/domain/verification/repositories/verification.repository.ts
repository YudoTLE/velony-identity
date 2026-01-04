import { type AggregateId } from '@shared-kernel/libs/entity';

import {
  type VerificationEntity,
  type VerificationType,
} from '@identity-domain/verification/aggregates/base-verification.entity';

export abstract class VerificationRepository {
  public abstract findByUserId(
    userId: AggregateId,
    type: VerificationType,
  ): Promise<VerificationEntity | null>;

  public abstract save(entity: VerificationEntity): Promise<void>;
}
