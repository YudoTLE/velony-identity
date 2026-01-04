import { DomainEvent } from '@velony/domain';

interface Payload {
  phoneNumber: string;
}

export class UserPhoneNumberUpdatedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'UserPhoneNumberUpdated';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
