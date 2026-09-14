import { NextRequest } from "next/server";
import { env } from "@/env";
import {
  type AssistantAction,
  type AssistantResponse,
  assistantRequestSchema,
  FALLBACK_REPLY,
} from "@/lib/assistant/schema";
import type { AvailableChannels } from "@/server/assistant/system-prompt";
import {
  assistantConfigured,
  AssistantUnavailableError,
  generateAssistantReply,
} from "@/server/assistant/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT = 30;
const MAX_BODY_BYTES = 32_000;

type RateEntry = { count: number; expiresAt: number };
const globalRateState = globalThis as typeof globalThis & {
  assistantRateLimits?: Map<string, RateEntry>;
};
const rateLimits =
  globalRateState.assistantRateLimits ??
  (globalRateState.assistantRateLimits = new Map());

function clientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  if (rateLimits.size > 10_000) {
    for (const [storedKey, stored] of rateLimits) {
      if (stored.expiresAt <= now) rateLimits.delete(storedKey);
    }
  }
  const entry = rateLimits.get(key);
  if (!entry || entry.expiresAt <= now) {
    rateLimits.set(key, { count: 1, expiresAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, retryAfter: 0 };
  }
  if (entry.count >= RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.expiresAt - now) / 1000),
    };
  }
  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, retryAfter: 0 };
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const requestHost =
      request.headers.get("host") ??
      request.headers.get("x-forwarded-host") ??
      new URL(request.url).host;
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

function problem(
  status: number,
  title: string,
  detail: string,
  requestId: string,
  extra?: Record<string, unknown>,
) {
  return Response.json(
    { type: "about:blank", title, status, detail, requestId, ...extra },
    {
      status,
      headers: {
        "Content-Type": "application/problem+json",
        "Cache-Control": "no-store",
      },
    },
  );
}

function availableChannels(): AvailableChannels {
  return {
    whatsapp: Boolean(env.NEXT_PUBLIC_WHATSAPP_NUMBER),
    email: Boolean(env.NEXT_PUBLIC_CONTACT_EMAIL),
    call: Boolean(env.NEXT_PUBLIC_CONTACT_PHONE),
  };
}

/** CTA set used whenever the model is unavailable, honoring wired channels. */
function fallbackActions(channels: AvailableChannels): AssistantAction[] {
  const actions: AssistantAction[] = [{ type: "book", label: "Book a call" }];
  if (channels.whatsapp)
    actions.push({ type: "whatsapp", label: "Chat on WhatsApp" });
  else actions.push({ type: "instagram", label: "Message on Instagram" });
  return actions;
}

function degradedResponse(channels: AvailableChannels): AssistantResponse {
  return {
    reply: FALLBACK_REPLY,
    language: "en",
    intent: "human_handoff",
    suggestions: [],
    actions: fallbackActions(channels),
    serviceIds: [],
    degraded: true,
  };
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  if (!sameOrigin(request)) {
    return problem(
      403,
      "Request not allowed",
      "Use the Pocket Reels 360 website to chat with the assistant.",
      requestId,
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return problem(
      415,
      "Unsupported request",
      "Send chat messages as JSON.",
      requestId,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return problem(
      413,
      "Request too large",
      "Keep your message shorter.",
      requestId,
    );
  }

  const rate = consumeRateLimit(clientKey(request));
  if (!rate.allowed) {
    return problem(
      429,
      "Too many requests",
      "Please slow down for a moment before sending more messages.",
      requestId,
      { retryAfter: rate.retryAfter },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (body && JSON.stringify(body).length > MAX_BODY_BYTES) {
    return problem(
      413,
      "Request too large",
      "Keep your message shorter.",
      requestId,
    );
  }

  const parsed = assistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    return problem(
      422,
      "Check your message",
      "The chat request was not valid.",
      requestId,
      { fieldErrors: parsed.error.flatten().fieldErrors },
    );
  }

  const channels = availableChannels();

  // No key configured: keep the widget useful with a canned handoff.
  if (!assistantConfigured()) {
    return Response.json(degradedResponse(channels), {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const reply = await generateAssistantReply(parsed.data.messages, channels);
    const payload: AssistantResponse = { ...reply, degraded: false };
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Remaining": String(rate.remaining),
      },
    });
  } catch (error) {
    if (error instanceof AssistantUnavailableError) {
      // Soft-fail: still hand the visitor a useful next step.
      return Response.json(degradedResponse(channels), {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }
    console.error("Assistant route failed", { requestId, error });
    return problem(
      500,
      "Something went wrong",
      "Please try again, or reach the crew on Instagram.",
      requestId,
    );
  }
}
