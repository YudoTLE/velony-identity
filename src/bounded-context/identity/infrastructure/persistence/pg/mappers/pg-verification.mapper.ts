import { Email } from '@identity-domain/user/value-objects/email.vo';
import { PhoneNumber } from '@identity-domain/user/value-objects/phone-number.vo';
import {
  type VerificationEntity,
  type VerificationType,
} from '@identity-domain/verification/aggregates/base-verification.entity';
import { EmailVerificationEntity } from '@identity-domain/verification/aggregates/email-verification.entity';
import { PhoneNumberVerificationEntity } from '@identity-domain/verification/aggregates/phone-number-verification.entity';

type VerificationPersistence = {
  id: string;
  userId: string;
  token: string;
  type: VerificationType;
  value: string;
  issuedAt: Date;
  expiresAt: Date;
  verifiedAt: Date | null;
  revokedAt: Date | null;
};

export class PgVerificationMapper {
  public static toEntity(
    persistence: VerificationPersistence,
  ): VerificationEntity {
    const baseProps = {
      id: persistence.id,
      userId: persistence.userId,
      token: persistence.token,
      issuedAt: persistence.issuedAt,
      expiresAt: persistence.expiresAt,
      verifiedAt: persistence.verifiedAt,
      revokedAt: persistence.revokedAt,
    };

    switch (persistence.type) {
      case 'email':
        return EmailVerificationEntity.reconstitute({
          ...baseProps,
          value: Email.create(persistence.value),
        });

      case 'phone_number':
        return PhoneNumberVerificationEntity.reconstitute({
          ...baseProps,
          value: PhoneNumber.create(persistence.value),
        });
    }
  }

  public static toPersistence(
    entity: VerificationEntity,
  ): VerificationPersistence {
    return {
      id: entity.id,
      userId: entity.userId,
      token: entity.token,
      type: entity.type,
      value: entity.value.value,
      issuedAt: entity.issuedAt,
      expiresAt: entity.expiresAt,
      verifiedAt: entity.verifiedAt,
      revokedAt: entity.revokedAt,
    };
  }
}
