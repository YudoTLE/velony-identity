import { DomainEvent } from '@velony/domain';

interface Payload {
  name: string;
  username: string;
  avatarPath?: string;
  email?: string;
  phoneNumber?: string;
}

export class UserCreatedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'UserCreated';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
