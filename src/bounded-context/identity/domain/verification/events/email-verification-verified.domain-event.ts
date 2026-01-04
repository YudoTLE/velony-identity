import { DomainEvent } from '@velony/domain';

interface Payload {
  verifiedAt: Date;
}

export class EmailVerificationVerifiedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'EmailVerificationVerified';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
