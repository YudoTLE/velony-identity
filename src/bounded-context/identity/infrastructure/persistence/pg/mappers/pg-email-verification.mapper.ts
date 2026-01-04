import { Email } from '@identity-domain/user/value-objects/email.vo';
import { EmailVerificationEntity } from '@identity-domain/verification/aggregates/email-verification.entity';

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
      id: persistence.id,
      userId: persistence.userId,
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
      id: entity.id,
      userId: entity.userId,
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
