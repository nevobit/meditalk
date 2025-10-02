export interface RateLimiter {
    consume(key: string): Promise<boolean>;
  }
  
  export class MemoryRateLimiter implements RateLimiter {
    private hits = new Map<string, { count: number; ts: number }>();
  
    constructor(private max: number, private windowMs: number) {}
  
    async consume(key: string): Promise<boolean> {
      const now = Date.now();
      const entry = this.hits.get(key);
      if (!entry || now - entry.ts > this.windowMs) {
        this.hits.set(key, { count: 1, ts: now });
        return true;
      }
      if (entry.count >= this.max) return false;
      entry.count++;
      return true;
    }
  }
  