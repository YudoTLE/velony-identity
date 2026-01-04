import { AsyncLocalStorage } from 'async_hooks';

import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from 'pg';
import { v7 as uuidv7 } from 'uuid';

import { TypedConfigService } from '@config/typed-config.service';

import { DomainEvent } from '@shared-kernel/libs/domain-event';

import {
  type OutboxPersistence,
  type PersistenceService,
} from '@identity-application/services/persistence.service';
import { ParamsBuilder } from '@identity-infrastructure/persistence/pg/utils/pg-params-builder';

export interface TransactionContext {
  client: PoolClient;
}

@Injectable()
export class PgService
  implements OnModuleInit, OnModuleDestroy, PersistenceService
{
  private pool: Pool;

  constructor(
    private readonly configService: TypedConfigService,
    private readonly asyncLocalStorage: AsyncLocalStorage<TransactionContext>,
  ) {}

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: this.configService.get('DB_URL'),
      ssl: this.configService.get('NODE_ENV') === 'production',
      max: this.configService.get('DB_MAX_CONNECTIONS'),
      idleTimeoutMillis: this.configService.get('DB_IDLE_TIMEOUT'),
      connectionTimeoutMillis: this.configService.get('DB_CONNECTION_TIMEOUT'),
    });

    // Test connection
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    const context = this.getTransactionContext();
    if (context) return context.client.query<T>(text, params);

    return this.pool.query<T>(text, params);
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const context = this.getTransactionContext();
    if (context) {
      const savepoint = `sp_${uuidv7()}`;
      await context.client.query(`SAVEPOINT ${savepoint}`);
      try {
        const result = await callback();
        await context.client.query(`RELEASE SAVEPOINT ${savepoint}`);
        return result;
      } catch (error) {
        await context.client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
        throw error;
      }
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await this.asyncLocalStorage.run({ client }, callback);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async enqueueToOutbox<TPayload>(
    events: DomainEvent<TPayload>[],
  ): Promise<void> {
    if (events.length === 0) return;

    const params = new ParamsBuilder();
    const rows: string[] = [];

    for (const event of events) {
      rows.push(
        `(
            ${params.push(event.id)},
            ${params.push(event.type)},
            ${params.push(event.aggregateId)},
            ${params.push(JSON.stringify(event.payload))}
          )`,
      );
    }

    await this.query(
      `INSERT INTO outbox (event_id, event_type, aggregate_id, payload)
         VALUES ${rows.join(', ')}`,
      params.getParams(),
    );
  }

  public async dispatchOutbox<TPayload>(
    handler: (outboxes: OutboxPersistence<TPayload>[]) => Promise<void>,
  ): Promise<void> {
    await this.transaction(async () => {
      const result = await this.query<OutboxPersistence<TPayload>>(
        `
          SELECT
            o.id AS "id",
            o.event_id AS "eventId",
            o.event_type AS "eventType",
            o.aggregate_id AS "aggregateId",
            o.payload AS "payload",
            o.enqueued_at AS "enqueuedAt"
          FROM outbox o
          WHERE o.dispatched_at IS NULL
          ORDER BY o.id ASC
          LIMIT 100
          FOR UPDATE SKIP LOCKED
        `,
      );
      if (!result.rowCount) return;

      await handler(result.rows);

      const ids = result.rows.map((r) => r.id);

      await this.query(
        `
          UPDATE outbox
          SET dispatched_at = NOW()
          WHERE id = ANY($1)
        `,
        [ids],
      );
    });
  }

  private getTransactionContext(): TransactionContext | undefined {
    return this.asyncLocalStorage.getStore();
  }
}
