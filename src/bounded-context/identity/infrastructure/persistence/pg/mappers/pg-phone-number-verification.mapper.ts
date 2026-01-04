import { PhoneNumber } from '@identity-domain/user/value-objects/phone-number.vo';
import { UserId } from '@identity-domain/user/value-objects/user-id.vo';
import { PhoneNumberVerificationEntity } from '@identity-domain/verification/aggregates/phone-number-verification.entity';
import { VerificationId } from '@identity-domain/verification/value-objects/user-id.vo';

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
      id: VerificationId.create(persistence.id),
      userId: UserId.create(persistence.userId),
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
      id: entity.id.value,
      userId: entity.userId.value,
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
