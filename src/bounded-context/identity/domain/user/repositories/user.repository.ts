import { type AggregateId } from '@shared-kernel/libs/entity';

import { type UserEntity } from '@identity-domain/user/aggregates/user.entity';
import { type Username } from '@identity-domain/user/value-objects/username.vo';

export abstract class UserRepository {
  public abstract findById(id: AggregateId): Promise<UserEntity | null>;

  public abstract findByUsername(
    username: Username,
  ): Promise<UserEntity | null>;

  public abstract save(entity: UserEntity): Promise<void>;
}
