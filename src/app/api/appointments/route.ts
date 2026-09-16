import { NextRequest } from "next/server";
import {
  appointmentSchema,
  isBookableDate,
} from "@/lib/appointment-schema";
import {
  BookingStorageUnavailableError,
  createAppointment,
} from "@/server/appointments/repository";
import { sendAppointmentEmails } from "@/server/appointments/email";
import { clientKey, createRateLimiter, problem } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limiter = createRateLimiter({
  name: "appointments",
  limit: 5,
  windowMs: 10 * 60 * 1000,
});

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

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  if (!sameOrigin(request)) {
    return problem(
      403,
      "Request not allowed",
      "Submit appointments from the Pocket Reels 360 website.",
      requestId,
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return problem(
      415,
      "Unsupported request",
      "Appointment data must be sent as JSON.",
      requestId,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 24_000) {
    return problem(
      413,
      "Request too large",
      "Keep event details under 3,000 characters.",
      requestId,
    );
  }

  const rate = limiter.consume(clientKey(request));
  if (!rate.allowed) {
    return problem(
      429,
      "Too many requests",
      "Please wait a few minutes before trying again.",
      requestId,
      undefined,
      {
        "Retry-After": String(rate.retryAfter),
        "X-RateLimit-Remaining": "0",
      },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (body && JSON.stringify(body).length > 24_000) {
    return problem(
      413,
      "Request too large",
      "Keep event details under 3,000 characters.",
      requestId,
    );
  }

  if (
    body &&
    typeof body === "object" &&
    "website" in body &&
    typeof body.website === "string" &&
    body.website.length > 0
  ) {
    return Response.json(
      { ok: true, id: requestId, status: "received", emailSent: null },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return problem(
      422,
      "Check your details",
      "One or more appointment fields need attention.",
      requestId,
      { fieldErrors: parsed.error.flatten().fieldErrors },
    );
  }

  if (!isBookableDate(parsed.data.date)) {
    return problem(
      422,
      "Choose another date",
      "Select a date within the next twelve months.",
      requestId,
      { fieldErrors: { date: ["Choose a future date"] } },
    );
  }

  try {
    const result = await createAppointment(parsed.data);
    if (!result.ok) {
      return problem(
        409,
        "Time already requested",
        "Choose another preferred date or time.",
        requestId,
      );
    }

    const delivery = result.created
      ? await sendAppointmentEmails(result.record)
      : null;

    return Response.json(
      {
        ok: true,
        id: result.record.id,
        status: result.record.status,
        emailSent: delivery?.customerSent ?? null,
        replayed: !result.created,
      },
      {
        status: result.created ? 201 : 200,
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Remaining": String(rate.remaining),
        },
      },
    );
  } catch (error) {
    console.error("Appointment request failed", { requestId, error });

    if (error instanceof BookingStorageUnavailableError) {
      return problem(
        503,
        "Booking is temporarily unavailable",
        "Please use Instagram to message Pocket Reels 360.",
        requestId,
      );
    }

    return problem(
      500,
      "Appointment could not be saved",
      "Please try again or message Pocket Reels 360 on Instagram.",
      requestId,
    );
  }
}
