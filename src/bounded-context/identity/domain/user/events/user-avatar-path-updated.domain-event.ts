import { DomainEvent } from '@velony/domain';

interface Payload {
  avatarPath: string;
}

export class UserAvatarPathUpdatedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'UserAvatarPathUpdated';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
