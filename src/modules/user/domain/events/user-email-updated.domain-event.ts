import { DomainEvent } from 'src/shared/domain/base.domain-event';
import { type AggregateId } from 'src/shared/domain/base.entity';

export class UserEmailUpdatedDomainEvent extends DomainEvent {
  public static readonly TYPE = 'UserEmailUpdated';

  constructor(
    aggregateId: AggregateId,
    public readonly props: {
      email: string;
    },
  ) {
    super(aggregateId);
  }
}
