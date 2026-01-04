import { DomainEvent } from '@velony/domain';

export class UserPasswordUpdatedDomainEvent extends DomainEvent<void> {
  public static readonly type = 'UserPasswordUpdated';
  public constructor(aggregateId: string) {
    super(aggregateId);
  }
}
