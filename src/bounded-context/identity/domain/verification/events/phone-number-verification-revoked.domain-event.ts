import { DomainEvent } from '@velony/domain';

interface Payload {
  revokedAt: Date;
}

export class PhoneNumberVerificationRevokedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'PhoneNumberVerificationRevoked';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
