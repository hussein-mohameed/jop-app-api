/**
 * @file In-memory rate limiter.
 * For production, replace with Redis-backed solution.
 */

import { RATE_LIMIT } from '@/lib/constants';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000); // Every minute

/**
 * Check rate limit for a given key.
 * @param key - Identifier (e.g., IP address, user ID)
 * @param maxRequests - Maximum requests in window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining count
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = RATE_LIMIT.MAX_REQUESTS,
  windowMs: number = RATE_LIMIT.WINDOW_MS
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Create a rate limit Response for API routes.
 */
export function rateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return Response.json(
    { success: false, error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      },
    }
  );
}
