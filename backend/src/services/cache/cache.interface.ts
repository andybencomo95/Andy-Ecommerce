/**
 * Cache — abstracción genérica para caché con TTL.
 * Permite cambiar entre InMemoryCache (dev) y RedisCache (prod) sin tocar la lógica.
 */

export interface Cache {
  readonly name: string;

  /** Obtener valor. Retorna null si no existe o expiró. */
  get<T>(key: string): Promise<T | null>;

  /** Guardar valor con TTL en segundos. */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /** Eliminar una clave. */
  del(key: string): Promise<void>;

  /** Eliminar múltiples claves que matcheen un patrón (ej: "products:*"). */
  delByPattern(pattern: string): Promise<void>;

  /** Limpiar toda la caché. */
  clear(): Promise<void>;
}

/** TTL por defecto: 60 segundos */
export const DEFAULT_TTL_SECONDS = 60;
