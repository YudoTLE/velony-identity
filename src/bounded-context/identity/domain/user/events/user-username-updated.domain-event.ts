import { DomainEvent } from '@velony/domain';

interface Payload {
  username: string;
}

export class UserUsernameUpdatedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'UserUsernameUpdated';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
