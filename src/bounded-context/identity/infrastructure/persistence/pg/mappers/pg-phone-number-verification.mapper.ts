import { PhoneNumber } from '@identity-domain/user/value-objects/phone-number.vo';
import { PhoneNumberVerificationEntity } from '@identity-domain/verification/aggregates/phone-number-verification.entity';

type PhoneNumberVerificationPersistence = {
  id: string;
  userId: string;
  token: string;
  type: 'phone_number';
  value: string;
  issuedAt: Date;
  expiresAt: Date;
  verifiedAt: Date | null;
  revokedAt: Date | null;
};

export class PgPhoneNumberVerificationMapper {
  public static toEntity(
    persistence: PhoneNumberVerificationPersistence,
  ): PhoneNumberVerificationEntity {
    return PhoneNumberVerificationEntity.reconstitute({
      id: persistence.id,
      userId: persistence.userId,
      token: persistence.token,
      value: PhoneNumber.create(persistence.value),
      issuedAt: persistence.issuedAt,
      expiresAt: persistence.expiresAt,
      verifiedAt: persistence.verifiedAt,
      revokedAt: persistence.revokedAt,
    });
  }

  public static toPersistence(
    entity: PhoneNumberVerificationEntity,
  ): PhoneNumberVerificationPersistence {
    return {
      id: entity.id,
      userId: entity.userId,
      token: entity.token,
      type: 'phone_number',
      value: entity.value.value,
      issuedAt: entity.issuedAt,
      expiresAt: entity.expiresAt,
      verifiedAt: entity.verifiedAt,
      revokedAt: entity.revokedAt,
    };
  }
}
