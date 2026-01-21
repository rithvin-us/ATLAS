type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();

/**
 * Simple token bucket rate limiter (client-side guard)
 * @param key unique key per user/action
 * @param limit max actions per interval
 * @param intervalMs window in ms
 */
export function enforceRateLimit(key: string, limit: number, intervalMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key) || { tokens: limit, lastRefill: now };

  // Refill tokens
  const elapsed = now - bucket.lastRefill;
  if (elapsed > intervalMs) {
    bucket.tokens = limit;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    const retryAfter = Math.max(intervalMs - elapsed, 0);
    buckets.set(key, bucket);
    return { allowed: false, retryAfter };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true, retryAfter: 0 };
}
