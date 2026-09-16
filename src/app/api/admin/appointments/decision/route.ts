import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdmin } from "@/server/admin-auth";
import {
  brandedHtml,
  notifyAddress,
  sendEmail,
} from "@/server/appointments/email";
import {
  findAppointment,
  updateAppointmentStatus,
  type AppointmentRecord,
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

  // 1. Attempt to send the customized email directly to the client:
  const emailSent = await sendEmail({
    to: appointment.email,
    subject: parsed.data.subject,
    text: parsed.data.body,
    html: brandedHtml(parsed.data.body),
    replyTo: notifyAddress() ?? undefined,
  });

  const status = parsed.data.decision === "approve" ? "confirmed" : "cancelled";
  let updatedRecord: AppointmentRecord | null = null;
  try {
    updatedRecord = await updateAppointmentStatus(appointment.id, status);
  } catch (error) {
    console.error("Decision status update failed", error);
  }

  const finalRecord = updatedRecord ?? { ...appointment, status };

  if (!emailSent) {
    // If direct send to client failed (e.g. Resend sandbox restriction), send copy to admin for manual forwarding:
    const adminTo = notifyAddress();
    if (adminTo) {
      const forwardSubject = `[Manual Forward Required] ${parsed.data.subject}`;
      const forwardText = `Direct email delivery to ${appointment.email} was not accepted by the mail provider.\n\nPlease forward this ${parsed.data.decision === "approve" ? "approval" : "decline"} message directly to ${appointment.email}:\n\n---\nSubject: ${parsed.data.subject}\n\n${parsed.data.body}`;
      await sendEmail({
        to: adminTo,
        subject: forwardSubject,
        text: forwardText,
        html: brandedHtml(forwardText, "Internal notice: Forward to client directly."),
        replyTo: appointment.email,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        emailSent: false,
        appointment: finalRecord,
        warning: `Booking marked as ${status}. Client email could not be sent directly (Resend sandbox requires a verified domain or Gmail SMTP); a copy was sent to your admin inbox for manual forwarding.`,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { ok: true, emailSent: true, appointment: finalRecord },
    { headers: { "Cache-Control": "no-store" } },
  );
}
