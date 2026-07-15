/**
 * InMemoryCache — implementación en memoria con TTL.
 * Usa un Map<key, { value, expiresAt }>.
 * No requiere dependencias externas.
 */

import type { Cache } from './cache.interface';
import { DEFAULT_TTL_SECONDS } from './cache.interface';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

export class InMemoryCache implements Cache {
  readonly name = 'in-memory';

  private readonly store = new Map<string, CacheEntry>();

  /* eslint-disable @typescript-eslint/require-await */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (entry === undefined) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? DEFAULT_TTL_SECONDS;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(
      `^${pattern.replace(/\*/g, '.*').replace(/\?/g, '.')}$`,
    );

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
  /* eslint-enable @typescript-eslint/require-await */
}
