export interface CachedItem {
  value: any;
  expiresAt: number;
}

export class CacheManager {
  private cache = new Map<string, CachedItem>();

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  generateKey(query: any): string {
    return JSON.stringify(query);
  }
} 