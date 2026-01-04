import { v7 as uuidv7 } from 'uuid';

import { type AggregateId } from '@shared-kernel/libs/entity';

export declare const DOMAIN_EVENT_BRAND: unique symbol;

export type DomainEventId = string;

export abstract class DomainEvent<TPayload = any> {
  private readonly [DOMAIN_EVENT_BRAND]: DomainEvent<TPayload>;

  public constructor(aggregateId: AggregateId, payload: TPayload) {
    this.id = uuidv7();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
    this.payload = payload;
  }

  public get type(): string {
    return (this.constructor as typeof DomainEvent).Type;
  }

  public static readonly Type: string;

  public readonly id: DomainEventId;

  public readonly aggregateId: AggregateId;

  public readonly occurredAt: Date;

  public readonly payload: TPayload;
}
