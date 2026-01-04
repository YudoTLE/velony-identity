import { DomainEvent } from '@shared-kernel/libs/domain-event';
import { Entity } from '@shared-kernel/libs/entity';

export declare const AGGREGATE_ROOT_BRAND: unique symbol;

export type DomainEventId = string;

export abstract class AggregateRoot extends Entity {
  private readonly [AGGREGATE_ROOT_BRAND]: AggregateRoot;

  protected _domainEvents: DomainEvent[] = [];

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  public pushDomainEvent<T>(event: DomainEvent<T>): void {
    this._domainEvents.push(event);
  }
}
