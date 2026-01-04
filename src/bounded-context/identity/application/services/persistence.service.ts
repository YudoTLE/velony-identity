import { type DomainEvent } from '@shared-kernel/libs/domain-event';

export type OutboxPersistence<TPayload = null> = {
  id: number;
  eventId: string;
  eventType: string;
  aggregateId: string;
  payload: TPayload;
  enqueuedAt: Date;
};

export abstract class PersistenceService {
  public abstract transaction<TResult>(
    callback: () => Promise<TResult>,
  ): Promise<TResult>;

  public abstract enqueueToOutbox<TPayload>(
    events: DomainEvent<TPayload>[],
  ): Promise<void>;

  public abstract dispatchOutbox<TPayload>(
    handler: (outboxes: OutboxPersistence<TPayload>[]) => Promise<void>,
  ): Promise<void>;
}
