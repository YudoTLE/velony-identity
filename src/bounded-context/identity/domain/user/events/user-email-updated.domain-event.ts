import { DomainEvent } from '@velony/domain';

interface Payload {
  email: string;
}

export class UserEmailUpdatedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'UserEmailUpdated';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
