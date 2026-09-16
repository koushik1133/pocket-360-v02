import "server-only";

import type { NextRequest } from "next/server";

/**
 * Shared helpers for the JSON route handlers: client identification, a small
 * in-memory fixed-window rate limiter, and an RFC 7807 problem response.
 *
 * The limiter is per-process. On serverless that means per warm instance,
 * which is fine for abuse throttling but must not be relied on for quotas.
 */

export function clientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

type RateEntry = { count: number; expiresAt: number };

const globalRateState = globalThis as typeof globalThis & {
  pocketReelsRateLimits?: Map<string, Map<string, RateEntry>>;
};
const buckets =
  globalRateState.pocketReelsRateLimits ??
  (globalRateState.pocketReelsRateLimits = new Map());

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets; 0 when allowed. */
  retryAfter: number;
};

export function createRateLimiter(options: {
  name: string;
  limit: number;
  windowMs: number;
}) {
  const store =
    buckets.get(options.name) ??
    (() => {
      const created = new Map<string, RateEntry>();
      buckets.set(options.name, created);
      return created;
    })();

  function sweep(now: number) {
    if (store.size <= 10_000) return;
    for (const [key, entry] of store) {
      if (entry.expiresAt <= now) store.delete(key);
    }
  }

  return {
    /** Records one hit and reports whether the caller is still under the limit. */
    consume(key: string): RateLimitResult {
      const now = Date.now();
      sweep(now);
      const entry = store.get(key);
      if (!entry || entry.expiresAt <= now) {
        store.set(key, { count: 1, expiresAt: now + options.windowMs });
        return { allowed: true, remaining: options.limit - 1, retryAfter: 0 };
      }
      if (entry.count >= options.limit) {
        return {
          allowed: false,
          remaining: 0,
          retryAfter: Math.ceil((entry.expiresAt - now) / 1000),
        };
      }
      entry.count += 1;
      return {
        allowed: true,
        remaining: options.limit - entry.count,
        retryAfter: 0,
      };
    },
    /** Checks the limit without recording a hit (for "is this caller locked out?"). */
    peek(key: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(key);
      if (!entry || entry.expiresAt <= now) {
        return { allowed: true, remaining: options.limit, retryAfter: 0 };
      }
      const allowed = entry.count < options.limit;
      return {
        allowed,
        remaining: Math.max(0, options.limit - entry.count),
        retryAfter: allowed ? 0 : Math.ceil((entry.expiresAt - now) / 1000),
      };
    },
  };
}

export function problem(
  status: number,
  title: string,
  detail: string,
  requestId: string,
  extra?: Record<string, unknown>,
  headers?: Record<string, string>,
) {
  return Response.json(
    { type: "about:blank", title, status, detail, requestId, ...extra },
    {
      status,
      headers: {
        "Content-Type": "application/problem+json",
        "Cache-Control": "no-store",
        ...headers,
      },
    },
  );
}
