/**
 * Cache factory.
 * Retorna InMemoryCache por defecto.
 * Si REDIS_URL está presente, retorna RedisCache.
 */

import config from '../../config';

import type { Cache } from './cache.interface';
import { InMemoryCache } from './in-memory-cache';
import { RedisCache } from './redis-cache';

let cache: Cache | null = null;

export function getCache(): Cache {
  if (cache !== null) {
    return cache;
  }

  if (config.redisUrl !== undefined && config.redisUrl !== '') {
    cache = new RedisCache(config.redisUrl);
  } else {
    cache = new InMemoryCache();
  }

  return cache;
}

export function resetCache(): void {
  cache = null;
}
