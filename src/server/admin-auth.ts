import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { clientKey, createRateLimiter } from "@/server/http";

export const ADMIN_COOKIE = "admin_pin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Every handler that checks the PIN counts a *failed* attempt against the
// caller, so no endpoint can be used to brute-force it.
const failedAuth = createRateLimiter({
  name: "admin-auth-failures",
  limit: 10,
  windowMs: 15 * 60 * 1000,
});

export function pinMatches(candidate: string | null | undefined) {
  if (!candidate) return false;
  const expected = Buffer.from(env.ADMIN_PASSWORD);
  const actual = Buffer.from(candidate);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

function presentedPin(request: NextRequest) {
  const pinHeader = request.headers.get("x-admin-pin");
  const authHeader = request.headers.get("authorization");
  const bearerPin = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const cookiePin = request.cookies.get(ADMIN_COOKIE)?.value;
  return pinHeader || bearerPin || cookiePin || null;
}

export function tooManyAttempts(retryAfter: number) {
  return NextResponse.json(
    { ok: false, error: "Too many attempts. Try again in a few minutes." },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(Math.max(1, retryAfter)),
      },
    },
  );
}

export function isLockedOut(request: NextRequest) {
  const state = failedAuth.peek(clientKey(request));
  return state.allowed ? null : tooManyAttempts(state.retryAfter);
}

/** Records a failed PIN attempt; returns a 429 when the caller is now locked out. */
export function recordFailedAttempt(request: NextRequest) {
  const attempt = failedAuth.consume(clientKey(request));
  return attempt.allowed ? null : tooManyAttempts(attempt.retryAfter);
}

export type AuthResult = { ok: true } | { ok: false; response: NextResponse };

export function authorizeAdmin(request: NextRequest): AuthResult {
  const locked = isLockedOut(request);
  if (locked) return { ok: false, response: locked };
  if (pinMatches(presentedPin(request))) return { ok: true };

  const nowLocked = recordFailedAttempt(request);
  if (nowLocked) return { ok: false, response: nowLocked };
  return {
    ok: false,
    response: NextResponse.json(
      { ok: false, error: "Unauthorized. Invalid admin PIN." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    ),
  };
}
