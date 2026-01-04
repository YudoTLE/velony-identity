import { DomainEvent } from '@velony/domain';

interface Payload {
  userId: string;
  token: string;
  value: string;
  issuedAt: Date;
  expiresAt: Date;
}

export class PhoneNumberVerificationIssuedDomainEvent extends DomainEvent<Payload> {
  public static readonly type = 'PhoneNumberVerificationIssued';

  public constructor(aggregateId: string, payload: Payload) {
    super(aggregateId, payload);
  }
}
