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
                <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e7e0d8;font-size:11px;color:#817a72;line-height:1.6">
                  <p style="margin:0 0 6px"><strong>Pocket Reels 360</strong> · Dallas (HQ), NYC, Chicago, Charlotte</p>
                  <p style="margin:0 0 6px">You received this email because an appointment inquiry was submitted at <a href="${escapeHtml(env.NEXT_PUBLIC_SITE_URL)}" style="color:#b53526;text-decoration:none">${escapeHtml(env.NEXT_PUBLIC_SITE_URL)}</a>.</p>
                  <p style="margin:0">
                    If this inquiry was submitted in error or you wish to cancel or unsubscribe from correspondence, simply reply to this email with "CANCEL" or contact us on Instagram <a href="https://www.instagram.com/pocketreels360/" style="color:#b53526;text-decoration:none">@pocketreels360</a>.
                  </p>
                  <p style="margin:8px 0 0;font-size:10px;color:#a8a197">
                    Reference Code: ${escapeHtml(record.id.slice(0, 8).toUpperCase())} · Confidential &amp; Protected Under Applicable Privacy Laws
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Internal notification email that includes a "Forward to client" banner
 * with the client's email address and a copy of the client confirmation text.
 * Used when no custom domain is verified (Resend only allows sending to the
 * account owner's email address from onboarding@resend.dev).
 */
function internalEmailWithClientCopy(record: AppointmentRecord, refCode: string) {
  const clientEmail = escapeHtml(record.email);
  const clientName  = escapeHtml(record.name);

  const details = [
    ["Package Type", record.packageType || "Wedding & Event Reels"],
    ["Date of Event", formattedDate(record.date)],
    ["Preferred Time to Call", record.preferredTimeToCall || formattedTime(record.time)],
    ["Full Name", record.name],
    ["📧 Client Email", record.email],
    ["📞 Client Phone", record.phone],
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
                <strong style="font-size:14px;letter-spacing:2px">POCKET REELS 360 — INTERNAL</strong>
              </td>
            </tr>
            <!-- Action banner: forward to client -->
            <tr>
              <td style="padding:20px 34px;background:#fff3cd;border-bottom:2px solid #f0c040">
                <p style="margin:0;font-size:14px;font-weight:700;color:#7a5700">
                  📨 ACTION REQUIRED: Forward a confirmation to the client
                </p>
                <p style="margin:6px 0 0;font-size:13px;color:#7a5700">
                  Client: <strong>${clientName}</strong> &nbsp;|&nbsp;
                  Email: <a href="mailto:${clientEmail}" style="color:#7a5700;font-weight:700">${clientEmail}</a>
                </p>
                <p style="margin:6px 0 0;font-size:12px;color:#9a7000">
                  Note: Client confirmation email couldn't be sent automatically (no verified sender domain).
                  Simply reply to this email CC'ing the client, or forward the message below.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 34px">
                <p style="margin:0 0 12px;color:#940111;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">🔔 New Booking Inquiry [${escapeHtml(refCode)}]</p>
                <h1 style="margin:0;font-size:28px;line-height:1.12;font-weight:600;letter-spacing:-0.5px">New Inquiry: ${clientName}</h1>
                <p style="margin:18px 0 28px;color:#524d47;font-size:15px;line-height:1.65">A client has submitted an inquiry for reel production. Please review their details and respond within 24 hours.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${detailRows}
                </table>
                <div style="margin-top:28px;padding:20px;background:#f5f0e9;border-radius:12px;border-left:4px solid #b53526">
                  <p style="margin:0 0 6px;color:#716b64;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Event Details &amp; Vision</p>
                  <p style="margin:0;color:#11100f;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(record.eventDetails || record.projectDetails || "No additional details provided.")}</p>
                </div>
                <!-- Client confirmation template to forward -->
                <div style="margin-top:32px;padding:20px;background:#f0f8ff;border-radius:12px;border:2px dashed #4a90d9">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#2d6db5">✂️ Forward this message to the client (${clientEmail}):</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#11100f">Hi ${clientName},</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#11100f;line-height:1.6">Thank you for reaching out to <strong>Pocket Reels 360</strong>! We've received your booking inquiry for <strong>${escapeHtml(record.packageType || record.service)}</strong> on <strong>${escapeHtml(formattedDate(record.date))}</strong>.</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#11100f;line-height:1.6">Our production team is reviewing your event details and will follow up with confirmation within 24 hours.</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#11100f">Your reference code: <strong>${escapeHtml(refCode)}</strong></p>
                  <p style="margin:0;font-size:14px;color:#11100f">— Pocket Reels 360 Team 🎬</p>
                </div>
                <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e7e0d8;font-size:11px;color:#817a72;line-height:1.6">
                  <p style="margin:0 0 6px"><strong>Pocket Reels 360</strong> · Dallas (HQ), NYC, Chicago, Charlotte</p>
                  <p style="margin:8px 0 0;font-size:10px;color:#a8a197">
                    Ref: ${escapeHtml(record.id.slice(0, 8).toUpperCase())} · Internal Use Only
                  </p>
                </div>
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
  if (!env.RESEND_API_KEY || !env.APPOINTMENT_FROM_EMAIL) {
    console.warn("[email] Resend not configured — RESEND_API_KEY or APPOINTMENT_FROM_EMAIL missing");
    return false;
  }

  const body = {
    from: `${env.APPOINTMENT_FROM_NAME} <${env.APPOINTMENT_FROM_EMAIL}>`,
    to: [payload.to],
    subject: payload.subject,
    html: payload.html,
    reply_to: payload.replyTo,
  };

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch (err) {
    console.error("[email] Network error sending via Resend", { to: payload.to, err: String(err) });
    return false;
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[email] Resend rejected email", {
      status: response.status,
      to: payload.to,
      subject: payload.subject,
      detail: detail.slice(0, 500),
    });
    return false;
  }

  const result = await response.json().catch(() => ({})) as { id?: string };
  console.info("[email] Resend accepted email", { id: result.id, to: payload.to });
  return true;
}

/**
 * Detects whether we're in test-mode (no verified custom domain).
 *
 * Resend only allows sending to the account owner's email when using
 * `onboarding@resend.dev`. If a custom domain has been verified and
 * configured via APPOINTMENT_FROM_EMAIL (e.g. hello@pocketreels360.com),
 * we can send directly to the client.
 */
function isResendTestMode() {
  return env.APPOINTMENT_FROM_EMAIL?.endsWith("@resend.dev") ?? true;
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
    console.warn("[email] Not configured — skipping appointment emails");
    return { configured: false, customerSent: false, internalSent: false };
  }

  const refCode = `PR-${record.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  const testMode = isResendTestMode();

  if (testMode) {
    // ── Test-mode: Resend only allows sending to the account owner's email ──
    // Send ONE combined email to the business (koushik.lf38@gmail.com) that:
    //   (a) notifies about the new booking
    //   (b) includes a ready-to-forward client confirmation template
    console.info("[email] Resend test mode — routing both emails to internal address", {
      internalAddress: env.APPOINTMENT_NOTIFY_EMAIL,
      clientEmail: record.email,
    });

    const internalResult = await sendResendEmail({
      to: env.APPOINTMENT_NOTIFY_EMAIL,
      subject: `📨 New Booking [${refCode}]: ${record.name} — Reply to ${record.email}`,
      html: internalEmailWithClientCopy(record, refCode),
      replyTo: record.email,
    });

    return {
      configured,
      customerSent: false, // can't send directly to client without verified domain
      internalSent: internalResult,
    };
  }

  // ── Production mode: verified custom domain — send both emails ──────────
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
    console.error("[email] Appointment email delivery failed", {
      appointmentId: record.id,
      customerError:
        customer.status === "rejected" ? String(customer.reason) : undefined,
      internalError:
        internal.status === "rejected" ? String(internal.reason) : undefined,
    });
  }

  return { configured, customerSent, internalSent };
}
