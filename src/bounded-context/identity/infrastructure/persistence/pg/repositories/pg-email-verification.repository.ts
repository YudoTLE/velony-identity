import { Injectable } from '@nestjs/common';

import { type UserId } from '@identity-domain/user/value-objects/user-id.vo';
import { type EmailVerificationEntity } from '@identity-domain/verification/aggregates/email-verification.entity';
import { EmailVerificationRepository } from '@identity-domain/verification/repositories/email-verification.repository';
import { PgEmailVerificationMapper } from '@identity-infrastructure/persistence/pg/mappers/pg-email-verification.mapper';
import { PgService } from '@identity-infrastructure/persistence/pg/pg.service';

@Injectable()
export class PgEmailVerificationRepository implements EmailVerificationRepository {
  public constructor(private readonly pgService: PgService) {}

  public async findByUserId(
    userId: UserId,
  ): Promise<EmailVerificationEntity | null> {
    const result = await this.pgService.query(
      `
        SELECT
          json_build_object(
            'id', v.uuid,
            'userId', v.user_id,
            'token', v.token,
            'type', v.type,
            'value', v.value,
            'issuedAt', v.issued_at,
            'expiresAt', v.expires_at,
            'verifiedAt', v.verified_at,
            'revokedAt', v.revoked_at
          ) as verification
        FROM verifications v
        WHERE v.user_id = $1
          AND v.type = 'email'
          AND v.verified_at IS NULL
          AND v.revoked_at IS NULL
        ORDER BY v.issued_at DESC
        LIMIT 1
      `,
      [userId],
    );
    if (!result.rows.at(0)) return null;

    return PgEmailVerificationMapper.toEntity(result.rows[0].verification);
  }

  public async save(entity: EmailVerificationEntity): Promise<void> {
    const data = PgEmailVerificationMapper.toPersistence(entity);

    await this.pgService.query(
      `
        INSERT INTO verifications (
          uuid,
          user_id,
          token,
          type,
          value,
          issued_at,
          expires_at,
          verified_at,
          revoked_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        ON CONFLICT (uuid) DO UPDATE SET
          expires_at = EXCLUDED.expires_at,
          verified_at = EXCLUDED.verified_at,
          revoked_at = EXCLUDED.revoked_at
      `,
      [
        data.id,
        data.userId,
        data.token,
        data.type,
        data.value,
        data.issuedAt,
        data.expiresAt,
        data.verifiedAt,
        data.revokedAt,
      ],
    );
  }
}
