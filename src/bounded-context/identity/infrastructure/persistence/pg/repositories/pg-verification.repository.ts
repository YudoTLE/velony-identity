import { Injectable } from '@nestjs/common';

import { type AggregateId } from '@shared-kernel/libs/entity';

import {
  type VerificationEntity,
  type VerificationType,
} from '@identity-domain/verification/aggregates/base-verification.entity';
import { VerificationRepository } from '@identity-domain/verification/repositories/verification.repository';
import { PgVerificationMapper } from '@identity-infrastructure/persistence/pg/mappers/pg-verification.mapper';
import { PgService } from '@identity-infrastructure/persistence/pg/pg.service';

@Injectable()
export class PgVerificationRepository implements VerificationRepository {
  public constructor(private readonly pgService: PgService) {}

  public async findByUserId(
    userId: AggregateId,
    type: VerificationType,
  ): Promise<VerificationEntity | null> {
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
          AND v.type = $2
          AND v.verified_at IS NULL
          AND v.revoked_at IS NULL
        ORDER BY v.issued_at DESC
        LIMIT 1
      `,
      [userId, type],
    );
    if (!result.rows.at(0)) return null;

    return PgVerificationMapper.toEntity(result.rows[0].verification);
  }

  public async save(entity: VerificationEntity): Promise<void> {
    const data = PgVerificationMapper.toPersistence(entity);

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
