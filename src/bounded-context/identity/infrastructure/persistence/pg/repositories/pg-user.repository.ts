import { Injectable } from '@nestjs/common';

import { type UserEntity } from '@identity-domain/user/aggregates/user.entity';
import { DuplicateEmailException } from '@identity-domain/user/exceptions/duplicate-email.exception';
import { DuplicatePhoneNumberException } from '@identity-domain/user/exceptions/duplicate-phone-number.exception';
import { DuplicateUsernameException } from '@identity-domain/user/exceptions/duplicate-username.exception';
import { UserRepository } from '@identity-domain/user/repositories/user.repository';
import { type UserId } from '@identity-domain/user/value-objects/user-id.vo';
import { type Username } from '@identity-domain/user/value-objects/username.vo';
import { PgUserMapper } from '@identity-infrastructure/persistence/pg/mappers/pg-user.mapper';
import { PgService } from '@identity-infrastructure/persistence/pg/pg.service';

@Injectable()
export class PgUserRepository implements UserRepository {
  public constructor(private readonly pgService: PgService) {}

  public async findById(id: UserId): Promise<UserEntity | null> {
    const result = await this.pgService.query(
      `
        SELECT
          json_build_object(
            'id', u.uuid,
            'name', u.name,
            'username', u.username,
            'avatarPath', u.avatar_path,
            'email', u.email,
            'phoneNumber', u.phone_number,
            'createdAt', u.created_at,
            'updatedAt', u.updated_at,
            'deletedAt', u.deleted_at,
            'authentication', json_build_object(
              'local', CASE
                WHEN la.uuid IS NOT NULL THEN json_build_object(
                  'id', la.uuid,
                  'passwordHash', la.password_hash,
                  'lastUsedAt', la.last_used_at,
                  'createdAt', la.created_at,
                  'updatedAt', la.updated_at
                )
                ELSE NULL
              END
            )
          ) as user
        FROM users u
        LEFT JOIN local_authentications la
          ON la.user_id = u.id
        WHERE u.uuid = $1
      `,
      [id],
    );

    if (!result.rows.at(0)) return null;

    return PgUserMapper.toEntity(result.rows[0].user);
  }

  public async findByUsername(username: Username): Promise<UserEntity | null> {
    const result = await this.pgService.query(
      `
        SELECT
          json_build_object(
            'id', u.uuid,
            'name', u.name,
            'username', u.username,
            'avatarPath', u.avatar_path,
            'email', u.email,
            'phoneNumber', u.phone_number,
            'createdAt', u.created_at,
            'updatedAt', u.updated_at,
            'deletedAt', u.deleted_at,
            'authentication', json_build_object(
              'local', CASE
                WHEN la.uuid IS NOT NULL THEN json_build_object(
                  'id', la.uuid,
                  'passwordHash', la.password_hash,
                  'lastUsedAt', la.last_used_at,
                  'createdAt', la.created_at,
                  'updatedAt', la.updated_at
                )
                ELSE NULL
              END
            )
          ) as user
        FROM users u
        LEFT JOIN local_authentications la
          ON la.user_id = u.id
        WHERE u.username = $1
      `,
      [username.value],
    );
    if (!result.rows.at(0)) return null;

    return PgUserMapper.toEntity(result.rows[0].user);
  }

  public async save(entity: UserEntity): Promise<void> {
    const data = PgUserMapper.toPersistence(entity);

    try {
      await this.pgService.transaction(async () => {
        await this.pgService.query(
          `
            INSERT INTO users (
              uuid,
              name,
              username,
              avatar_path,
              email,
              phone_number,
              created_at,
              updated_at,
              deleted_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
            ON CONFLICT (uuid) DO UPDATE SET
              name = EXCLUDED.name,
              username = EXCLUDED.username,
              avatar_path = EXCLUDED.avatar_path,
              email = EXCLUDED.email,
              phone_number = EXCLUDED.phone_number,
              updated_at = EXCLUDED.updated_at,
              deleted_at = EXCLUDED.deleted_at
          `,
          [
            data.id,
            data.name,
            data.username,
            data.avatarPath,
            data.email,
            data.phoneNumber,
            data.createdAt,
            data.updatedAt,
            data.deletedAt,
          ],
        );

        if (data.authentication.local) {
          await this.pgService.query(
            `
              INSERT INTO local_authentications (
                uuid,
                user_id,
                password_hash,
                last_used_at,
                created_at,
                updated_at
              ) VALUES (
                $1,
                (SELECT u.id FROM users u WHERE u.uuid = $2),
                $3, $4, $5, $6
              )
              ON CONFLICT (uuid) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                last_used_at = EXCLUDED.last_used_at,
                updated_at = EXCLUDED.updated_at
            `,
            [
              data.authentication.local.id,
              data.id,
              data.authentication.local.passwordHash,
              data.authentication.local.lastUsedAt,
              data.authentication.local.createdAt,
              data.authentication.local.updatedAt,
            ],
          );
        }
      });
    } catch (error) {
      if (error.code === '23505') {
        const constraintName = error.constraint;

        if (constraintName === 'users_username_key') {
          throw new DuplicateUsernameException(entity.username.value);
        }
        if (constraintName === 'users_email_key') {
          throw new DuplicateEmailException(entity.email!.value);
        }
        if (constraintName === 'users_phone_number_key') {
          throw new DuplicatePhoneNumberException(entity.phoneNumber!.value);
        }
      }

      throw error;
    }
  }
}
