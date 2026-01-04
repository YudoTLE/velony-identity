import { DomainEvent } from '@velony/domain';

interface Payload {
  name: string;
}

export class UserNameUpdatedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'UserNameUpdated';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
