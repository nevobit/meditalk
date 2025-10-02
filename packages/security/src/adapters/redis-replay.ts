import type { Redis } from "ioredis";

export async function useNonce(redis: Redis, nonce: string, ttlSec = 300): Promise<boolean> {
  const key = `nonce:${nonce}`;
  const res = await redis.set(key, "1", "EX", ttlSec, "NX");
  return res === "OK"; 
}
