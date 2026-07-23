interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Minimal process-local TTL cache. Best-effort: a missing or expired key simply returns
 * `undefined` so the caller refetches. Lazy expiry only — the keyspace here is tiny
 * (locations, catalog), so no active eviction is needed. No DB, no Redis (project scope).
 */
export class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
