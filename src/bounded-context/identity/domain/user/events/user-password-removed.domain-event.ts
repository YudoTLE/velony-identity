import { DomainEvent } from '@velony/domain';

export class UserPasswordRemovedDomainEvent extends DomainEvent<void> {
  public static readonly type = 'UserPasswordRemoved';
  public constructor(aggregateId: string) {
    super(aggregateId);
  }
}
