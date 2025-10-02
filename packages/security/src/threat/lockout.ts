const attempts = new Map<string, { count: number; ts: number }>();

export function recordFailure(userId: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = attempts.get(userId);
  if (!entry || now - entry.ts > windowMs) {
    attempts.set(userId, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}
