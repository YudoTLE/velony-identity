import { DomainEvent } from '@velony/domain';

interface Payload {
  revokedAt: Date;
}

export class EmailVerificationRevokedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'EmailVerificationRevoked';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
