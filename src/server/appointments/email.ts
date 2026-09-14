import "server-only";

import type { AppointmentRecord } from "@/server/appointments/repository";
import { serviceLabel } from "@/lib/appointment-schema";
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
    ["Service", serviceLabel(record.service)],
    ["Date", formattedDate(record.date)],
    ["Preferred time", formattedTime(record.time)],
    ["Name", record.name],
    ["Phone", record.phone],
    ["Email", record.email],
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
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fffdf9;border-radius:18px;overflow:hidden">
            <tr>
              <td style="padding:30px 34px;background:#11100f;color:#fffaf2">
                <div style="display:inline-block;border:1px solid #fffaf2;border-radius:999px;padding:7px 10px;color:#ff4d91;margin-right:10px">▶</div>
                <strong style="font-size:14px;letter-spacing:2px">POCKET REELS 360</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 34px">
                <p style="margin:0 0 12px;color:#a21b55;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Appointment</p>
                <h1 style="margin:0;font-size:34px;line-height:1.08;font-weight:600;letter-spacing:-1px">${escapeHtml(title)}</h1>
                <p style="margin:18px 0 28px;color:#625d57;font-size:15px;line-height:1.65">${escapeHtml(intro)}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${detailRows}
                </table>
                <div style="margin-top:28px;padding:18px;background:#f5f0e9;border-radius:12px">
                  <p style="margin:0 0 6px;color:#716b64;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Project details</p>
                  <p style="margin:0;color:#11100f;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(record.projectDetails || "No additional project details provided.")}</p>
                </div>
                <p style="margin:28px 0 0;color:#817a72;font-size:12px">Reference: ${escapeHtml(record.id)}</p>
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

  const [customer, internal] = await Promise.allSettled([
    sendResendEmail({
      to: record.email,
      subject: "Your Pocket Reels 360 appointment request",
      html: emailShell(
        "Your appointment request is in.",
        "We received your preferred date and time. The Pocket Reels crew will contact you to confirm the details.",
        record,
      ),
      replyTo: env.APPOINTMENT_NOTIFY_EMAIL,
    }),
    sendResendEmail({
      to: env.APPOINTMENT_NOTIFY_EMAIL,
      subject: `New appointment request — ${record.name}`,
      html: emailShell(
        "A new appointment request.",
        "Review the project details below and contact the customer to confirm.",
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
