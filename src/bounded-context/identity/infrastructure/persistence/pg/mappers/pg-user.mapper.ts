import { StoragePath } from '@shared-kernel/value-objects/storage-path.vo';

import { LocalAuthenticationEntity } from '@identity-domain/user/aggregates/local-authentication.entity';
import { UserEntity } from '@identity-domain/user/aggregates/user.entity';
import { Email } from '@identity-domain/user/value-objects/email.vo';
import { Name } from '@identity-domain/user/value-objects/name.vo';
import { PasswordHash } from '@identity-domain/user/value-objects/password-hash.vo';
import { PhoneNumber } from '@identity-domain/user/value-objects/phone-number.vo';
import { Username } from '@identity-domain/user/value-objects/username.vo';

type UserPersistence = {
  id: string;
  name: string;
  username: string;
  avatarPath: string | null;
  email: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  authentication: {
    local:
      | {
          id: string;
          passwordHash: string;
          lastUsedAt: Date;
          createdAt: Date;
          updatedAt: Date;
        }
      | undefined;
  };
};

export class PgUserMapper {
  public static toEntity(persistence: UserPersistence): UserEntity {
    return UserEntity.reconstitute({
      id: persistence.id,
      name: Name.create(persistence.name),
      username: Username.create(persistence.username),
      avatarPath:
        persistence.avatarPath !== null
          ? StoragePath.create(persistence.avatarPath)
          : null,
      email:
        persistence.email !== null ? Email.create(persistence.email) : null,
      phoneNumber:
        persistence.phoneNumber !== null
          ? PhoneNumber.create(persistence.phoneNumber)
          : null,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
      deletedAt: persistence.deletedAt,
      authentication: {
        local: persistence.authentication.local
          ? LocalAuthenticationEntity.reconstitute({
              id: persistence.authentication.local.id,
              passwordHash: PasswordHash.create(
                persistence.authentication.local.passwordHash,
              ),
              lastUserAt: persistence.authentication.local.lastUsedAt,
              createdAt: persistence.authentication.local.createdAt,
              updatedAt: persistence.authentication.local.updatedAt,
            })
          : undefined,
      },
    });
  }

  public static toPersistence(entity: UserEntity): UserPersistence {
    return {
      id: entity.id,
      name: entity.name.value,
      username: entity.username.value,
      avatarPath: entity.avatarPath?.value ?? null,
      email: entity.email?.value ?? null,
      phoneNumber: entity.phoneNumber?.value ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      authentication: {
        local: entity.authentication.local
          ? {
              id: entity.authentication.local.id,
              passwordHash: entity.authentication.local.passwordHash.value,
              lastUsedAt: entity.authentication.local.lastUsedAt,
              createdAt: entity.authentication.local.createdAt,
              updatedAt: entity.authentication.local.updatedAt,
            }
          : undefined,
      },
    };
  }
}
