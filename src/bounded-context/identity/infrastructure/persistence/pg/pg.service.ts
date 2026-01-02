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

import { PersistenceService } from '@identity-application/services/persistence.service';

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

  private getTransactionContext(): TransactionContext | undefined {
    return this.asyncLocalStorage.getStore();
  }
}
