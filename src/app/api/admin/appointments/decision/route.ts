import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdmin } from "@/server/admin-auth";
import {
  brandedHtml,
  canEmailClients,
  notifyAddress,
  sendEmail,
} from "@/server/appointments/email";
import {
  findAppointment,
  updateAppointmentStatus,
} from "@/server/appointments/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const decisionSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approve", "deny"]),
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10).max(6000),
});

/**
 * Approve or deny a booking. Sends the crew-edited email to the client and
 * then records the new status. The email is sent first so a delivery failure
 * is reported before the booking is marked as answered.
 */
export async function POST(request: NextRequest) {
  const auth = authorizeAdmin(request);
  if (!auth.ok) return auth.response;

  const parsed = decisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Send a booking id, decision, subject, and body." },
      { status: 422 },
    );
  }

  const appointment = await findAppointment(parsed.data.id);
  if (!appointment) {
    return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
  }

  if (!canEmailClients()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email to clients is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD (or a verified Resend domain), then try again.",
      },
      { status: 503 },
    );
  }

  const emailSent = await sendEmail({
    to: appointment.email,
    subject: parsed.data.subject,
    text: parsed.data.body,
    html: brandedHtml(parsed.data.body),
    replyTo: notifyAddress() ?? undefined,
  });

  if (!emailSent) {
    return NextResponse.json(
      { ok: false, error: "The email could not be sent. The booking status was not changed." },
      { status: 502 },
    );
  }

  const status = parsed.data.decision === "approve" ? "confirmed" : "cancelled";
  try {
    const record = await updateAppointmentStatus(appointment.id, status);
    return NextResponse.json(
      { ok: true, emailSent: true, appointment: record ?? { ...appointment, status } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Decision status update failed after email was sent", error);
    return NextResponse.json(
      {
        ok: true,
        emailSent: true,
        appointment: { ...appointment, status },
        warning: "Email sent, but the status could not be saved. Refresh and set it manually.",
      },
      { status: 207 },
    );
  }
}
