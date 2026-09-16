import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  authorizeAdmin,
  isLockedOut,
  pinMatches,
  recordFailedAttempt,
} from "@/server/admin-auth";
import {
  appointmentStatuses,
  listAppointments,
  updateAppointmentStatus,
} from "@/server/appointments/repository";
import { referenceCode } from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── CSV ──────────────────────────────────────────────────────────────────────

function escapeCsv(value: string | undefined | null) {
  const text = String(value ?? "").replace(/"/g, '""');
  // Neutralise spreadsheet formula injection (=, +, -, @ at cell start).
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe}"`;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = authorizeAdmin(request);
  if (!auth.ok) return auth.response;

  const appointments = await listAppointments();
  const format = request.nextUrl.searchParams.get("format");

  if (format === "csv") {
    const headers = [
      "Reference",
      "ID",
      "Created At",
      "Package / Service",
      "Event Date",
      "Call Window / Time",
      "Client Name",
      "Phone",
      "Email",
      "Country",
      "State",
      "City",
      "Venue",
      "Event Details",
      "Status",
    ];

    const rows = appointments.map((apt) => [
      escapeCsv(referenceCode(apt.id)),
      escapeCsv(apt.id),
      escapeCsv(apt.createdAt),
      escapeCsv(apt.packageType || apt.service),
      escapeCsv(apt.date),
      escapeCsv(apt.preferredTimeToCall || apt.time),
      escapeCsv(apt.name),
      escapeCsv(apt.phone),
      escapeCsv(apt.email),
      escapeCsv(apt.country),
      escapeCsv(apt.state),
      escapeCsv(apt.city),
      escapeCsv(apt.locationVenue),
      escapeCsv(apt.eventDetails || apt.projectDetails),
      escapeCsv(apt.status),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\r\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pocket-reels-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(
    { ok: true, count: appointments.length, appointments },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

/** Exchange a PIN for an httpOnly session cookie. */
export async function POST(request: NextRequest) {
  const locked = isLockedOut(request);
  if (locked) return locked;

  const body = (await request.json().catch(() => null)) as { pin?: string } | null;
  const pin = body?.pin?.trim();

  if (pinMatches(pin)) {
    const response = NextResponse.json({ ok: true, message: "Authenticated" });
    response.cookies.set(ADMIN_COOKIE, env.ADMIN_PASSWORD, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ADMIN_COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  }

  const nowLocked = recordFailedAttempt(request);
  if (nowLocked) return nowLocked;

  return NextResponse.json(
    { ok: false, error: "Incorrect PIN. Check with the crew lead for access." },
    { status: 401 },
  );
}

const statusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(appointmentStatuses),
});

/** Update a booking's status without emailing the client. */
export async function PATCH(request: NextRequest) {
  const auth = authorizeAdmin(request);
  if (!auth.ok) return auth.response;

  const body: unknown = await request.json().catch(() => null);
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Send a booking id and a valid status." },
      { status: 422 },
    );
  }

  try {
    const record = await updateAppointmentStatus(
      parsed.data.id,
      parsed.data.status,
    );
    if (!record) {
      return NextResponse.json(
        { ok: false, error: "Booking not found." },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { ok: true, appointment: record },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Admin status update failed", error);
    return NextResponse.json(
      { ok: false, error: "The status could not be saved. Try again." },
      { status: 500 },
    );
  }
}

/** Log out: clear the session cookie. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
