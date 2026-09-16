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

function degradedResponse(
  channels: AvailableChannels,
  lastUserMessage?: string,
): AssistantResponse {
  const query = (lastUserMessage ?? "").toLowerCase().trim();

  // 1. Privacy Policy query
  if (/privacy|private|data|policy/i.test(query)) {
    return {
      reply:
        "Pocket Reels 360 values your privacy. We only collect the contact and event details you share to coordinate your shoot, and we never sell or share your data. You can open and read our complete Privacy Policy below.",
      language: "en",
      intent: "privacy",
      suggestions: ["What kind of reels do you make?", "How do I book a shoot?"],
      actions: [
        { type: "privacy", label: "Open Privacy Policy" },
        { type: "book", label: "Book a Shoot" },
      ],
      serviceIds: [],
      degraded: true,
    };
  }

  // 2. Terms & Conditions query
  if (/terms|condition|agreement|contract/i.test(query)) {
    return {
      reply:
        "Pocket Reels 360 provides vertical video shoot, edit, and delivery services based on clear, custom scoped agreements. You can view our full terms and conditions below.",
      language: "en",
      intent: "terms",
      suggestions: ["What do you shoot on?", "Where do you operate?"],
      actions: [
        { type: "terms", label: "Terms & Conditions" },
        { type: "book", label: "Book a Shoot" },
      ],
      serviceIds: [],
      degraded: true,
    };
  }

  // 3. Off-topic query rejection
  if (
    /python|javascript|coding|recipe|cook|bake|weather|homework|math|calc|president|stock|crypto|crypto\b|bitcoin|translate|who is|joke/i.test(
      query,
    )
  ) {
    return {
      reply:
        "I'm exclusively here to assist with Pocket Reels 360 video production, packages, and bookings. How can I help you with your next video project?",
      language: "en",
      intent: "off_topic",
      suggestions: [
        "What kind of reels do you make?",
        "Where are your production hubs?",
        "How do I book a shoot?",
      ],
      actions: [
        { type: "services", label: "Explore Services" },
        { type: "book", label: "Book a Shoot" },
      ],
      serviceIds: [],
      degraded: true,
    };
  }

  // 4. Portfolio & Work
  if (/work|portfolio|sample|example|anirudh|kiran|aurum|show me|video/i.test(query)) {
    return {
      reply:
        "We specialize in vertical 9:16 reels for live events (concerts, music tours), brands, luxury real estate, and portrait milestones. Check out our featured portfolio below!",
      language: "en",
      intent: "portfolio",
      suggestions: ["What do you shoot on?", "How much does a shoot cost?"],
      actions: [
        { type: "work", label: "View Portfolio" },
        { type: "book", label: "Book a Shoot" },
      ],
      serviceIds: ["event-reels", "brand-reels"],
      degraded: true,
    };
  }

  // 5. Pricing & Packages
  if (/price|pricing|cost|how much|rate|package|quote/i.test(query)) {
    return {
      reply:
        "Every shoot is custom-quoted based on coverage hours, location, and speed. Submit an enquiry on our booking page to get a clear package quote within 24 hours.",
      language: "en",
      intent: "pricing",
      suggestions: ["What do you shoot on?", "Where do you operate?"],
      actions: [
        { type: "book", label: "Get a Custom Quote" },
        { type: "whatsapp", label: "Chat on WhatsApp" },
      ],
      serviceIds: ["event-reels", "brand-reels"],
      degraded: true,
    };
  }

  // 6. Hubs & Locations
  if (/location|where|city|dallas|nyc|new york|chicago|charlotte|travel/i.test(query)) {
    return {
      reply:
        "Pocket Reels 360 has active production hubs in Dallas (HQ), New York City, Chicago, and Charlotte, and we also travel nationwide for select events and tours.",
      language: "en",
      intent: "company_info",
      suggestions: ["How do I book a shoot?", "What gear do you shoot on?"],
      actions: [{ type: "book", label: "Check Availability" }],
      serviceIds: [],
      degraded: true,
    };
  }

  // 7. Gear & Tech
  if (/gear|iphone|camera|tech|4k|prores|hardware/i.test(query)) {
    return {
      reply:
        "Everything is shot on iPhone in 4K ProRes with mobile gimbals and pro wireless lavalier audio — keeping the crew agile, fast, and close to the action.",
      language: "en",
      intent: "services",
      suggestions: ["What kind of reels do you make?", "How do I book?"],
      actions: [
        { type: "services", label: "Our Services" },
        { type: "book", label: "Book a Shoot" },
      ],
      serviceIds: [],
      degraded: true,
    };
  }

  // Default fallback
  return {
    reply: FALLBACK_REPLY,
    language: "en",
    intent: "human_handoff",
    suggestions: [
      "What kind of reels do you make?",
      "How much does a reel cost?",
      "I want to book a shoot",
    ],
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
  const lastUserMsg =
    parsed.data.messages[parsed.data.messages.length - 1]?.content;

  // No key configured: keep the widget useful with a contextual handoff.
  if (!assistantConfigured()) {
    return Response.json(degradedResponse(channels, lastUserMsg), {
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
      return Response.json(degradedResponse(channels, lastUserMsg), {
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
