import "server-only";

import nodemailer from "nodemailer";
import type { AppointmentRecord } from "@/server/appointments/repository";
import { env } from "@/env";
import {
  confirmationDraft,
  formatEventDate,
  referenceCode,
} from "@/lib/email-templates";
import { DEFAULT_PACKAGE_TYPE } from "@/lib/appointment-schema";

export type EmailTransport = "gmail" | "resend" | "none";

export type EmailDelivery = {
  configured: boolean;
  transport: EmailTransport;
  customerSent: boolean;
  internalSent: boolean;
};

// ─── Transport selection ──────────────────────────────────────────────────────

/**
 * Gmail (SMTP with an App Password) is preferred because it sends from the
 * crew's own address and can reach any recipient. Resend is used when a
 * verified domain is configured. onboarding@resend.dev can only deliver to
 * the Resend account owner, so it is treated as "internal notifications only".
 */
export function emailTransport(): EmailTransport {
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) return "gmail";
  if (env.RESEND_API_KEY && env.APPOINTMENT_FROM_EMAIL) return "resend";
  return "none";
}

export function resendIsSandbox() {
  return env.APPOINTMENT_FROM_EMAIL?.endsWith("@resend.dev") ?? true;
}

/** Can this configuration deliver mail to an arbitrary client address? */
export function canEmailClients() {
  const transport = emailTransport();
  if (transport === "gmail") return true;
  if (transport === "resend") return !resendIsSandbox();
  return false;
}

export function senderAddress() {
  if (emailTransport() === "gmail") return env.GMAIL_USER ?? null;
  return env.APPOINTMENT_FROM_EMAIL ?? null;
}

export function notifyAddress() {
  // With Gmail the crew inbox is the sender itself unless overridden.
  return env.APPOINTMENT_NOTIFY_EMAIL ?? env.GMAIL_USER ?? null;
}

// ─── Low-level send ───────────────────────────────────────────────────────────

export type OutgoingEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

let cachedSmtp: nodemailer.Transporter | null = null;

function smtp() {
  cachedSmtp ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
    connectionTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return cachedSmtp;
}

async function sendViaGmail(email: OutgoingEmail) {
  try {
    const info = await smtp().sendMail({
      from: `"${env.APPOINTMENT_FROM_NAME}" <${env.GMAIL_USER}>`,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: email.replyTo,
    });
    console.info("[email] Gmail accepted message", { id: info.messageId, to: email.to });
    return true;
  } catch (error) {
    console.error("[email] Gmail send failed", { to: email.to, error: String(error) });
    return false;
  }
}

async function sendViaResend(email: OutgoingEmail) {
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${env.APPOINTMENT_FROM_NAME} <${env.APPOINTMENT_FROM_EMAIL}>`,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
        reply_to: email.replyTo,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    console.error("[email] Network error sending via Resend", { to: email.to, error: String(error) });
    return false;
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[email] Resend rejected email", {
      status: response.status,
      to: email.to,
      subject: email.subject,
      detail: detail.slice(0, 500),
    });
    return false;
  }

  const result = (await response.json().catch(() => ({}))) as { id?: string };
  console.info("[email] Resend accepted email", { id: result.id, to: email.to });
  return true;
}

/** Sends one email through the configured transport. Never throws. */
export async function sendEmail(email: OutgoingEmail): Promise<boolean> {
  const transport = emailTransport();
  if (transport === "gmail") return sendViaGmail(email);
  if (transport === "resend") return sendViaResend(email);
  console.warn("[email] No transport configured; skipping", { subject: email.subject });
  return false;
}

// ─── HTML rendering ───────────────────────────────────────────────────────────

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Wraps a plain-text body (as written by the crew) in the branded shell. */
export function brandedHtml(text: string, footerNote?: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map(escapeHtml).join("<br>");
      return `<p style="margin:0 0 16px;color:#141312;font-size:15px;line-height:1.65">${lines}</p>`;
    })
    .join("");

  const footer =
    footerNote ??
    `You are receiving this because you submitted a booking inquiry at ${env.NEXT_PUBLIC_SITE_URL}. Reply to this email with "CANCEL" to withdraw your request.`;

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f2eb;font-family:Arial,Helvetica,sans-serif;color:#141312">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:32px 16px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fffdf9;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06)">
            <tr>
              <td style="padding:26px 34px;background:#141312;color:#fffaf2">
                <span style="display:inline-block;border:1px solid #fffaf2;border-radius:999px;padding:6px 10px;color:#cc101e;margin-right:10px">&#9654;</span>
                <strong style="font-size:14px;letter-spacing:2px">POCKET REELS 360</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 34px 24px">${paragraphs}</td>
            </tr>
            <tr>
              <td style="padding:0 34px 30px;font-size:11px;color:#817a72;line-height:1.6">
                <p style="margin:0 0 6px;padding-top:16px;border-top:1px solid #e7e0d8"><strong>Pocket Reels 360</strong> · Dallas (HQ), NYC, Chicago, Charlotte · Shot on iPhone in 4K ProRes</p>
                <p style="margin:0">${escapeHtml(footer)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function internalNotificationText(record: AppointmentRecord, ref: string) {
  const where =
    [record.locationVenue, record.city, record.state, record.country]
      .filter(Boolean)
      .join(", ") || "To be confirmed";
  return [
    `New booking inquiry [${ref}]`,
    "",
    `Client: ${record.name}`,
    `Email: ${record.email}`,
    `Phone: ${record.phone}`,
    `Package: ${record.packageType || DEFAULT_PACKAGE_TYPE}`,
    `Event date: ${formatEventDate(record.date)}`,
    `Preferred call window: ${record.preferredTimeToCall || record.time}`,
    `Location / venue: ${where}`,
    "",
    "Event details:",
    record.eventDetails || record.projectDetails || "No additional details provided.",
    "",
    `Approve or decline from the admin portal: ${env.NEXT_PUBLIC_SITE_URL}/admin`,
  ].join("\n");
}

// ─── Booking notifications ────────────────────────────────────────────────────

export async function sendAppointmentEmails(
  record: AppointmentRecord,
): Promise<EmailDelivery> {
  const transport = emailTransport();
  const internalTo = notifyAddress();

  if (transport === "none" || !internalTo) {
    console.warn("[email] Not configured — skipping appointment emails");
    return { configured: false, transport, customerSent: false, internalSent: false };
  }

  const ref = referenceCode(record.id);
  const confirmation = confirmationDraft(record);
  const internalSubject = `📨 New Booking [${ref}]: ${record.name} — ${record.packageType || DEFAULT_PACKAGE_TYPE}`;
  const internalText = internalNotificationText(record, ref);

  if (!canEmailClients()) {
    // Resend sandbox: only the account owner can receive mail. Send one internal
    // email that carries the client's draft so the crew can forward it.
    const combined = `${internalText}\n\n---\nClient confirmation to forward to ${record.email}:\n\n${confirmation.body}`;
    const internalSent = await sendEmail({
      to: internalTo,
      subject: internalSubject,
      text: combined,
      html: brandedHtml(
        combined,
        "Internal notification. Add GMAIL_USER + GMAIL_APP_PASSWORD (or a verified Resend domain) to email clients directly.",
      ),
      replyTo: record.email,
    });
    return { configured: true, transport, customerSent: false, internalSent };
  }

  const [customerSent, internalSent] = await Promise.all([
    sendEmail({
      to: record.email,
      subject: confirmation.subject,
      text: confirmation.body,
      html: brandedHtml(confirmation.body),
      replyTo: internalTo,
    }),
    sendEmail({
      to: internalTo,
      subject: internalSubject,
      text: internalText,
      html: brandedHtml(internalText, "Internal notification from the booking form."),
      replyTo: record.email,
    }),
  ]);

  return { configured: true, transport, customerSent, internalSent };
}
