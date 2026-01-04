import { Email } from '@identity-domain/user/value-objects/email.vo';
import { UserId } from '@identity-domain/user/value-objects/user-id.vo';
import { EmailVerificationEntity } from '@identity-domain/verification/aggregates/email-verification.entity';
import { VerificationId } from '@identity-domain/verification/value-objects/user-id.vo';

type EmailVerificationPersistence = {
  id: string;
  userId: string;
  token: string;
  type: 'email';
  value: string;
  issuedAt: Date;
  expiresAt: Date;
  verifiedAt: Date | null;
  revokedAt: Date | null;
};

export class PgEmailVerificationMapper {
  public static toEntity(
    persistence: EmailVerificationPersistence,
  ): EmailVerificationEntity {
    return EmailVerificationEntity.reconstitute({
      id: VerificationId.create(persistence.id),
      userId: UserId.create(persistence.userId),
      token: persistence.token,
      value: Email.create(persistence.value),
      issuedAt: persistence.issuedAt,
      expiresAt: persistence.expiresAt,
      verifiedAt: persistence.verifiedAt,
      revokedAt: persistence.revokedAt,
    });
  }

  public static toPersistence(
    entity: EmailVerificationEntity,
  ): EmailVerificationPersistence {
    return {
      id: entity.id.value,
      userId: entity.userId.value,
      token: entity.token,
      type: 'email',
      value: entity.value.value,
      issuedAt: entity.issuedAt,
      expiresAt: entity.expiresAt,
      verifiedAt: entity.verifiedAt,
      revokedAt: entity.revokedAt,
    };
  }
}
