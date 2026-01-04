import { DomainEvent } from '@velony/domain';

interface Payload {
  userId: string;
  token: string;
  value: string;
  issuedAt: Date;
  expiresAt: Date;
}

export class EmailVerificationIssuedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'EmailVerificationIssued';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
