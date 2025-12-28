import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from 'pg';
import { TypedConfigService } from 'src/config/typed-config.service';

@Injectable()
export class PgService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(private readonly configService: TypedConfigService) {}

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: this.configService.get('DB_URL'),
      ssl: this.configService.get('SERVICE_ENV') === 'production',
      max: this.configService.get('DB_MAX_CONNECTIONS'),
      idleTimeoutMillis: this.configService.get('DB_IDLE_TIMEOUT'),
      connectionTimeoutMillis: this.configService.get('DB_CONNECTION_TIMEOUT'),
    });

    const client = await this.pool.connect();
    client.release();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<T>(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
