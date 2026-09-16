/**
 * Plain-text email drafts shared by the admin UI (to prefill the composer) and
 * the server (to send). Pure module: safe to import from the browser.
 */

export const BRAND_NAME = "Pocket Reels 360";
export const BRAND_SIGNATURE = `— ${BRAND_NAME} Team 🎬`;

export type DraftAppointment = {
  id: string;
  name: string;
  packageType: string;
  date: string;
  time: string;
  preferredTimeToCall: string;
  city: string;
  state: string;
  country: string;
  locationVenue: string;
  eventDetails: string;
};

export function referenceCode(id: string) {
  return `PR-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export function formatEventDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "your requested date";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name.trim() || "there";
}

function locationLine(a: DraftAppointment) {
  return [a.locationVenue, a.city, a.state].filter(Boolean).join(", ");
}

// ─── Client confirmation (sent automatically on booking) ─────────────────────

export function confirmationDraft(a: DraftAppointment) {
  const ref = referenceCode(a.id);
  return {
    subject: `Booking inquiry received [${ref}] — ${BRAND_NAME}`,
    body: [
      `Hi ${firstName(a.name)},`,
      "",
      `Thank you for reaching out to ${BRAND_NAME}! We've received your booking inquiry for ${a.packageType} on ${formatEventDate(a.date)}.`,
      "",
      "Our production team is reviewing your event details and will follow up with confirmation within 24 hours.",
      "",
      `Your reference code: ${ref}`,
      "",
      BRAND_SIGNATURE,
    ].join("\n"),
  };
}

// ─── Approve ─────────────────────────────────────────────────────────────────

export function approveDraft(a: DraftAppointment) {
  const ref = referenceCode(a.id);
  const where = locationLine(a);
  return {
    subject: `Your ${BRAND_NAME} shoot is confirmed [${ref}]`,
    body: [
      `Hi ${firstName(a.name)},`,
      "",
      `Great news — your ${a.packageType} booking is confirmed for ${formatEventDate(a.date)}${where ? ` in ${where}` : ""}.`,
      "",
      "Here's what happens next:",
      `• Our producer will call you during your preferred window (${a.preferredTimeToCall || "as agreed"}) to lock the schedule and shot list.`,
      "• We'll share a short pre-shoot checklist so the day runs smoothly.",
      "• Finished 9:16 reels are delivered ready to post within 24–48 hours of the shoot.",
      "",
      "If anything about the date, venue, or scope changes, just reply to this email.",
      "",
      `Reference code: ${ref}`,
      "",
      "We can't wait to capture your story.",
      "",
      BRAND_SIGNATURE,
    ].join("\n"),
  };
}

// ─── Deny ────────────────────────────────────────────────────────────────────

export const denyReasons = [
  {
    id: "no-coverage",
    label: "No crew coverage in that location",
    paragraph:
      "Unfortunately we don't currently have a crew covering your location. Our production hubs are Dallas, New York City, Chicago, and Charlotte, and we weren't able to arrange travel for this date.",
  },
  {
    id: "date-unavailable",
    label: "Crew already booked on that date",
    paragraph:
      "Unfortunately our crew is already fully booked on your requested date, and we don't want to commit to something we can't deliver at the standard you deserve.",
  },
  {
    id: "outside-scope",
    label: "Request is outside what we produce",
    paragraph:
      "Having reviewed the details, this project falls outside the vertical short-form reels we specialise in, so we're not the right crew for it.",
  },
  {
    id: "incomplete",
    label: "Need more details before we can confirm",
    paragraph:
      "We weren't able to confirm this booking yet because a few key details are missing (event schedule, venue, and the deliverables you have in mind). If you can reply with those, we'll take another look right away.",
  },
  {
    id: "other",
    label: "Other (write your own)",
    paragraph:
      "Unfortunately we're not able to take on this booking at the moment.",
  },
] as const;

export type DenyReasonId = (typeof denyReasons)[number]["id"];

export function denyDraft(a: DraftAppointment, reasonId: DenyReasonId) {
  const ref = referenceCode(a.id);
  const reason =
    denyReasons.find((item) => item.id === reasonId) ?? denyReasons[4];
  return {
    subject: `About your ${BRAND_NAME} booking request [${ref}]`,
    body: [
      `Hi ${firstName(a.name)},`,
      "",
      `Thank you for considering ${BRAND_NAME} for your ${a.packageType} on ${formatEventDate(a.date)}.`,
      "",
      reason.paragraph,
      "",
      "If your plans change, or you'd like to talk through an alternative date or location, reply to this email and we'll do our best to help.",
      "",
      `Reference code: ${ref}`,
      "",
      BRAND_SIGNATURE,
    ].join("\n"),
  };
}
