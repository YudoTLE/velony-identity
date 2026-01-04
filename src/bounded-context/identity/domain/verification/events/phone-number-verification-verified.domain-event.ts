import { DomainEvent } from '@velony/domain';

interface Payload {
  verifiedAt: Date;
}

export class PhoneNumberVerificationVerifiedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'PhoneNumberVerificationVerified';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
