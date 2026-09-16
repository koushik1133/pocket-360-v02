import "server-only";

import type { AppointmentRecord } from "@/server/appointments/repository";
import { env } from "@/env";

export type EmailDelivery = {
  configured: boolean;
  customerSent: boolean;
  internalSent: boolean;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formattedTime(value: string) {
  const [hours = "0", minutes = "00"] = value.split(":");
  const date = new Date(2000, 0, 1, Number(hours), Number(minutes));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function emailShell(title: string, intro: string, record: AppointmentRecord) {
  const details = [
    ["Package Type", record.packageType || "Wedding & Event Reels"],
    ["Date of Event", formattedDate(record.date)],
    ["Preferred Time to Call", record.preferredTimeToCall || formattedTime(record.time)],
    ["Full Name", record.name],
    ["Contact Number", record.phone],
    ["Email Address", record.email],
    [
      "Location / Venue",
      [record.locationVenue, record.city, record.state, record.country]
        .filter(Boolean)
        .join(", ") || "To be confirmed",
    ],
  ];

  const detailRows = details
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e7e0d8;color:#716b64;font-size:13px;width:38%">${escapeHtml(label ?? "")}</td>
          <td style="padding:12px 0;border-bottom:1px solid #e7e0d8;color:#11100f;font-size:14px;font-weight:600">${escapeHtml(value ?? "")}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f0e9;font-family:Arial,Helvetica,sans-serif;color:#11100f">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:32px 16px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fffdf9;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06)">
            <tr>
              <td style="padding:30px 34px;background:#11100f;color:#fffaf2">
                <div style="display:inline-block;border:1px solid #fffaf2;border-radius:999px;padding:7px 10px;color:#d92027;margin-right:10px">▶</div>
                <strong style="font-size:14px;letter-spacing:2px">POCKET REELS 360</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 34px">
                <p style="margin:0 0 12px;color:#940111;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">✨ Booking Inquiry Received</p>
                <h1 style="margin:0;font-size:32px;line-height:1.12;font-weight:600;letter-spacing:-0.5px">${escapeHtml(title)}</h1>
                <p style="margin:18px 0 28px;color:#524d47;font-size:15px;line-height:1.65">${escapeHtml(intro)}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${detailRows}
                </table>
                <div style="margin-top:28px;padding:20px;background:#f5f0e9;border-radius:12px;border-left:4px solid #b53526">
                  <p style="margin:0 0 6px;color:#716b64;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Event Details &amp; Vision</p>
                  <p style="margin:0;color:#11100f;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(record.eventDetails || record.projectDetails || "No additional event details provided.")}</p>
                </div>
                <div style="margin-top:28px;padding:16px;background:#ede7de;border-radius:10px;text-align:center">
                  <p style="margin:0;color:#2b2826;font-size:13px;font-weight:600">
                    ⚡ 24hr Guaranteed Review &bull; 💎 Clear Transparent Packages &bull; 📱 Shot in 4K HDR
                  </p>
                </div>
                <p style="margin:28px 0 0;color:#817a72;font-size:12px">Inquiry Reference ID: ${escapeHtml(record.id)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendResendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!env.RESEND_API_KEY || !env.APPOINTMENT_FROM_EMAIL) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${env.APPOINTMENT_FROM_NAME} <${env.APPOINTMENT_FROM_EMAIL}>`,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Appointment email provider rejected request", {
      status: response.status,
      detail: detail.slice(0, 300),
    });
    return false;
  }

  return true;
}

export async function sendAppointmentEmails(
  record: AppointmentRecord,
): Promise<EmailDelivery> {
  const configured = Boolean(
    env.RESEND_API_KEY &&
      env.APPOINTMENT_FROM_EMAIL &&
      env.APPOINTMENT_NOTIFY_EMAIL,
  );
  if (!configured || !env.APPOINTMENT_NOTIFY_EMAIL) {
    return { configured: false, customerSent: false, internalSent: false };
  }

  const refCode = `PR-${record.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

  const [customer, internal] = await Promise.allSettled([
    sendResendEmail({
      to: record.email,
      subject: `✨ Booking Inquiry Confirmed [${refCode}] — ${record.name} (${record.packageType || record.service})`,
      html: emailShell(
        "Let's make your story unforgettable.",
        "Thank you for reaching out! We are thrilled to collaborate with you. Our production team is currently reviewing your event details, location, and creative vision. We will follow up with confirmation and personalized recommendations within 24 hours.",
        record,
      ),
      replyTo: env.APPOINTMENT_NOTIFY_EMAIL,
    }),
    sendResendEmail({
      to: env.APPOINTMENT_NOTIFY_EMAIL,
      subject: `New Booking [${refCode}]: ${record.name} · ${record.date} at ${record.preferredTimeToCall || record.time}`,
      html: emailShell(
        `New Inquiry: ${record.name} [${refCode}]`,
        "A client has submitted an inquiry for reel production. Please review their details and respond within 24 hours.",
        record,
      ),
      replyTo: record.email,
    }),
  ]);

  const customerSent = customer.status === "fulfilled" && customer.value;
  const internalSent = internal.status === "fulfilled" && internal.value;

  if (customer.status === "rejected" || internal.status === "rejected") {
    console.error("Appointment email delivery failed", {
      appointmentId: record.id,
      customerError:
        customer.status === "rejected" ? String(customer.reason) : undefined,
      internalError:
        internal.status === "rejected" ? String(internal.reason) : undefined,
    });
  }

  return { configured, customerSent, internalSent };
}
