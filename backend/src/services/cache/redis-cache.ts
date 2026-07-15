/**
 * RedisCache — implementación con Redis.
 * Usa el cliente `redis` oficial de Node.js.
 * Se conecta a REDIS_URL del entorno.
 * Usa sendCommand para evitar tipos genéricos complejos.
 */

import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

import type { Cache } from './cache.interface';
import { DEFAULT_TTL_SECONDS } from './cache.interface';

export class RedisCache implements Cache {
  readonly name = 'redis';

  private readonly client: RedisClientType;

  constructor(url: string) {
    this.client = createClient({ url });

    this.client.on('error', (err: Error) => {
      console.error('Redis connection error:', err.message);
    });

    this.client.connect().catch((err: Error) => {
      console.error('Redis connection failed:', err.message);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? DEFAULT_TTL_SECONDS;
    const serialized = JSON.stringify(value);

    try {
      await this.client.setEx(key, ttl, serialized);
    } catch {
      /* Silently fail */
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      /* ignore */
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      let cursor = 0;
      do {
        const result = (await this.client.scan(String(cursor), {
          MATCH: pattern,
          COUNT: 100,
        })) as unknown as { cursor: string; keys: string[] };

        cursor = Number(result.cursor);
        const keys = result.keys;
        if (keys.length > 0) {
          for (const key of keys) {
            await this.client.del(key);
          }
        }
      } while (cursor !== 0);
    } catch {
      /* ignore */
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushDb();
    } catch {
      /* ignore */
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      /* ignore */
    }
  }
}
