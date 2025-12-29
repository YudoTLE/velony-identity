import { DomainEvent } from 'src/shared/domain/base.domain-event';
import { type AggregateId } from 'src/shared/domain/base.entity';

export class UserPhoneNumberUpdatedDomainEvent extends DomainEvent {
  public static readonly TYPE = 'UserPhoneNumberUpdated';

  constructor(
    aggregateId: AggregateId,
    public readonly props: {
      phoneNumber: string;
    },
  ) {
    super(aggregateId);
  }
}
