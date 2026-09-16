"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  DownloadIcon,
  InstagramIcon,
  MailIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { brand } from "@/content/site";
import { whatsappUrl } from "@/lib/contact-links";

export const packageOptions = [
  {
    id: "wedding-reels",
    name: "Wedding & Reception Reels",
    tag: "Most Popular",
    desc: "Cinematic vertical coverage of vows, reception, portraits, and highlights.",
  },
  {
    id: "event-concerts",
    name: "Live Events & Concerts",
    tag: "High Energy",
    desc: "Fast-paced rhythm-cut reels capturing stage, crowd energy, and artists.",
  },
  {
    id: "brand-commercial",
    name: "Brand & Commercial Reels",
    tag: "Business",
    desc: "Polished social ads, product debuts, venue tours, and commercial stories.",
  },
  {
    id: "portrait-creator",
    name: "Portrait & Creator Moments",
    tag: "Creator",
    desc: "Personal branding, fashion, lifestyle, and high-impact creator content.",
  },
  {
    id: "corporate-gala",
    name: "Corporate, Summit & Gala",
    tag: "Enterprise",
    desc: "Keynotes, VIP networking, gala recaps, and brand leadership moments.",
  },
  {
    id: "custom-production",
    name: "Custom Production Package",
    tag: "Bespoke",
    desc: "Multi-day festival, destination shoot, or custom multi-crew deployment.",
  },
] as const;

export const timeOptions = [
  "Morning (9:00 AM – 12:00 PM)",
  "Afternoon (12:00 PM – 5:00 PM)",
  "Evening (5:00 PM – 8:00 PM)",
  "Anytime (Flexible)",
] as const;

export type BookingFields = {
  service: string;
  packageType: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  state: string;
  city: string;
  locationVenue: string;
  date: string;
  time: string;
  preferredTimeToCall: string;
  eventDetails: string;
  projectDetails: string;
  website: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
};

type FieldErrors = Partial<Record<keyof BookingFields, string>>;

type SuccessData = {
  id: string;
  emailSent: boolean | null;
  replayed: boolean;
};

type BookingFormProps = {
  whatsappNumber?: string;
  contactEmail?: string;
};

const steps = [
  "SERVICE",
  "DATE",
  "TIME",
  "DETAILS",
  "PROJECT",
  "CONFIRM",
] as const;

const initialFields: BookingFields = {
  service: "reel-production",
  packageType: "",
  name: "",
  phone: "",
  email: "",
  country: "United States",
  state: "",
  city: "",
  locationVenue: "",
  date: "",
  time: "",
  preferredTimeToCall: "",
  eventDetails: "",
  projectDetails: "",
  website: "",
  ageConfirmed: false,
  termsAccepted: false,
};

/** Consent flags are validated client-side only; the API schema does not accept them. */
function submittableFields(fields: BookingFields) {
  const copy: Partial<BookingFields> = { ...fields };
  if (!copy.time || copy.time.trim() === "") {
    copy.time = "12:00";
  }
  delete copy.ageConfirmed;
  delete copy.termsAccepted;
  return copy as Omit<BookingFields, "ageConfirmed" | "termsAccepted">;
}

function localDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value: string) {
  if (!value) return "Not selected";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function displayTime(value: string) {
  if (!value) return "Flexible";
  const [hours = "12", minutes = "00"] = value.split(":");
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, Number(hours), Number(minutes)));
}

function validateStep(step: number, fields: BookingFields): FieldErrors {
  const errors: FieldErrors = {};

  if (step === 0) {
    if (!fields.packageType) {
      errors.packageType = "Please select a package type.";
    }
  }

  if (step === 1) {
    if (!fields.date) errors.date = "Choose a preferred date.";
    else if (fields.date < localDateInput(new Date())) {
      errors.date = "Choose today or a future date.";
    }
  }

  if (step === 2) {
    if (!fields.time && !fields.preferredTimeToCall) {
      errors.time = "Choose a preferred time.";
    }
  }

  if (step === 3) {
    if (fields.name.trim().length < 2) errors.name = "Enter your full name.";
    const phoneDigits = fields.phone.replace(/\D/g, "");
    if (phoneDigits.length < 7) errors.phone = "Enter a valid contact number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      errors.email = "Enter a valid email address.";
    }
  }

  if (step === 4) {
    if (fields.eventDetails.length > 3000) {
      errors.eventDetails = "Keep event details under 3,000 characters.";
    }
    if (fields.projectDetails.length > 3000) {
      errors.projectDetails = "Keep project details under 3,000 characters.";
    }
  }

  if (step === 5) {
    // Consent must be an affirmative action: never pre-checked, always validated.
    if (!fields.ageConfirmed) {
      errors.ageConfirmed = "Confirm you are 18 or older to continue.";
    }
    if (!fields.termsAccepted) {
      errors.termsAccepted = "Accept the Terms of Service and Privacy Policy to continue.";
    }
  }

  return errors;
}

function structuredMessage(fields: BookingFields, reference?: string) {
  return [
    "Hi Pocket Reels 360, I'd like to submit an enquiry for reel production:",
    "",
    `Full Name: ${fields.name}`,
    `Contact Number: ${fields.phone}`,
    `Email: ${fields.email}`,
    `Package: ${fields.packageType}`,
    `Date of Event: ${displayDate(fields.date)}`,
    `Preferred Time to Call: ${fields.preferredTimeToCall || displayTime(fields.time)}`,
    `Country: ${fields.country}`,
    `State / Region: ${fields.state || "N/A"}`,
    `City: ${fields.city || "N/A"}`,
    `Location / Venue: ${fields.locationVenue || "N/A"}`,
    `Event Details: ${fields.eventDetails || fields.projectDetails || "Not provided"}`,
    reference ? `Reference ID: ${reference}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function googleCalendarUrl(fields: BookingFields, reference: string) {
  const compactDate = (fields.date || localDateInput(new Date())).replaceAll("-", "");
  const timeVal = fields.time && fields.time.includes(":") ? fields.time : "12:00";
  const [h = "12", m = "00"] = timeVal.split(":");
  const compactTime = `${h.padStart(2, "0")}${m.padStart(2, "0")}00`;
  const endHour = String((Number(h) + 1) % 24).padStart(2, "0");
  const compactEndTime = `${endHour}${m.padStart(2, "0")}00`;

  const title = encodeURIComponent(
    `Pocket Reels 360: ${fields.packageType || "Reel Production"}`,
  );
  const details = encodeURIComponent(
    `Pocket Reels 360 Production Enquiry\n\nPackage: ${fields.packageType}\nClient: ${fields.name} (${fields.phone}, ${fields.email})\nPreferred Window: ${fields.preferredTimeToCall || displayTime(fields.time)}\nReference ID: ${reference}\n\nProject Scope: ${fields.eventDetails || fields.projectDetails || "N/A"}`,
  );
  const location = encodeURIComponent(
    [fields.locationVenue, fields.city, fields.state, fields.country]
      .filter(Boolean)
      .join(", ") || "Pocket Reels 360 Studio / On-Location",
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${compactDate}T${compactTime}/${compactDate}T${compactEndTime}&details=${details}&location=${location}`;
}

function downloadCalendar(fields: BookingFields, reference: string) {
  const compactDate = fields.date.replaceAll("-", "");
  const timeVal = fields.time && fields.time.includes(":") ? fields.time : "12:00";
  const compactTime = `${timeVal.replace(":", "")}00`;
  const escape = (value: string) =>
    value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pocket Reels 360//Enquiry//EN",
    "BEGIN:VEVENT",
    `UID:${reference}@pocketreels360`,
    `DTSTAMP:${new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${compactDate}T${compactTime}`,
    "SUMMARY:Pocket Reels 360 enquiry",
    `DESCRIPTION:${escape(`Enquiry for ${fields.packageType}. Reference: ${reference}`)}`,
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const href = URL.createObjectURL(
    new Blob([calendar], { type: "text/calendar;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = "pocket-reels-360-enquiry.ics";
  anchor.click();
  URL.revokeObjectURL(href);
}

export function BookingForm({
  whatsappNumber,
  contactEmail,
}: BookingFormProps) {
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<BookingFields>(initialFields);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const idempotencyKey = useRef("");
  const formRef = useRef<HTMLFormElement>(null);

  const today = new Date();
  const latest = new Date();
  latest.setFullYear(latest.getFullYear() + 1);

  const update = <K extends keyof BookingFields>(
    key: K,
    value: BookingFields[K],
  ) => {
    setFields((current) => {
      const next = { ...current, [key]: value };
      // Keep eventDetails and projectDetails in sync for backwards compatibility
      if (key === "eventDetails" && typeof value === "string") {
        next.projectDetails = value;
      }
      if (key === "projectDetails" && typeof value === "string") {
        next.eventDetails = value;
      }
      return next;
    });
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  };

  const focusFirstError = () => {
    window.setTimeout(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }, 0);
  };

  const goNext = () => {
    const nextErrors = validateStep(step, fields);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError();
      return;
    }
    setErrors({});
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submit = async () => {
    const finalErrors = {
      ...validateStep(0, fields),
      ...validateStep(1, fields),
      ...validateStep(2, fields),
      ...validateStep(3, fields),
      ...validateStep(4, fields),
      ...validateStep(5, fields),
    };
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      const firstStep = finalErrors.packageType
        ? 0
        : finalErrors.date
          ? 1
          : finalErrors.time
            ? 2
            : finalErrors.name || finalErrors.phone || finalErrors.email
              ? 3
              : finalErrors.eventDetails || finalErrors.projectDetails
                ? 4
                : 5;
      setStep(firstStep);
      focusFirstError();
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    idempotencyKey.current ||= crypto.randomUUID();

    try {
      const payload = {
        ...submittableFields(fields),
        service: "reel-production",
        projectDetails: fields.eventDetails || fields.projectDetails || "Enquiry submission",
        idempotencyKey: idempotencyKey.current,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as
        | {
            id?: string;
            emailSent?: boolean | null;
            replayed?: boolean;
            detail?: string;
            fieldErrors?: Record<string, string[]>;
          }
        | null;

      if (!response.ok || !body?.id) {
        if (body?.fieldErrors) {
          const serverErrors = Object.fromEntries(
            Object.entries(body.fieldErrors).map(([key, values]) => [
              key,
              values[0],
            ]),
          ) as FieldErrors;
          setErrors(serverErrors);
        }
        if (response.status === 409) setStep(1);
        setSubmitError(
          body?.detail ??
            "We couldn't save your enquiry. Please try again.",
        );
        focusFirstError();
        return;
      }

      setSuccess({
        id: body.id,
        emailSent: body.emailSent ?? null,
        replayed: Boolean(body.replayed),
      });
    } catch {
      setSubmitError(
        "We couldn't reach the booking service. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const whatsapp = whatsappUrl(
      whatsappNumber,
      structuredMessage(fields, success.id),
    );
    const emailHref = contactEmail
      ? `mailto:${contactEmail}?subject=${encodeURIComponent("Pocket Reels 360 Enquiry")}&body=${encodeURIComponent(structuredMessage(fields, success.id))}`
      : null;
    const gCalHref = googleCalendarUrl(fields, success.id);

    return (
      <section className="booking-success" aria-live="polite">
        <span className="booking-success__check">
          <CheckIcon size={32} />
        </span>
        <p className="eyebrow text-accent font-semibold tracking-wider">ENQUIRY RECEIVED</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1 text-ink">
          You&apos;re all set.
        </h1>
        <p className="booking-success__lede">
          Your appointment request has been received for <strong>{fields.packageType}</strong>. Our crew will review your event details and respond within 24 hours.
        </p>
        <div className="booking-success__date">
          <div>
            <span>Date of Event</span>
            <strong>{displayDate(fields.date)}</strong>
          </div>
          <div>
            <span>Call Window</span>
            <strong>{fields.preferredTimeToCall || displayTime(fields.time)}</strong>
          </div>
        </div>
        <p className="booking-success__email">
          {success.emailSent
            ? `A confirmation email has been sent to ${fields.email}.`
            : success.replayed
              ? "This enquiry was previously received and logged."
              : "Your enquiry was saved successfully. Keep the reference below."}
        </p>
        <p className="booking-success__reference">Reference: {success.id}</p>
        <div className="booking-success__actions">
          <a
            className="button button--dark"
            href={gCalHref}
            target="_blank"
            rel="noreferrer"
          >
            <CalendarIcon size={17} />
            Add to Google Calendar ↗
          </a>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => downloadCalendar(fields, success.id)}
          >
            <DownloadIcon size={17} />
            Download .ics
          </button>
          {whatsapp ? (
            <a
              className="button button--ghost"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon size={17} />
              WhatsApp
            </a>
          ) : null}
          {emailHref ? (
            <a className="button button--ghost" href={emailHref}>
              <MailIcon size={17} />
              Email
            </a>
          ) : null}
          <Link className="button button--ghost" href="/">
            Back to home
          </Link>
        </div>
        <a
          className="booking-success__instagram"
          href={brand.instagramUrl}
          target="_blank"
          rel="noreferrer"
        >
          <InstagramIcon size={18} />
          Message {brand.handle}
        </a>
      </section>
    );
  }

  return (
    <div className="enquiry-card bg-surface border border-line rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* ─── Trust Badges Header ─── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pb-5 border-b border-line mb-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          24hr response time
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          💎 Clear packages
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          📱 Shot on iPhone
        </span>
      </div>

      <form
        ref={formRef}
        className="booking-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (step === steps.length - 1) void submit();
          else goNext();
        }}
        noValidate
      >
        <div className="booking-progress" aria-label="Booking progress">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              className={index === step ? "is-current" : ""}
              aria-current={index === step ? "step" : undefined}
              aria-label={`${index + 1}. ${label}`}
              disabled={index > step}
              onClick={() => index < step && setStep(index)}
            >
              <span>{index < step ? <CheckIcon size={13} /> : index + 1}</span>
              <small>{label}</small>
            </button>
          ))}
        </div>

        <div className="booking-form__body">
          {/* ─── Step 0: Select Service ─── */}
          {step === 0 ? (
            <fieldset className="booking-step">
              <legend>
                <span>STEP 1</span>
                Select service
              </legend>

              <div className="flex flex-col gap-4 mt-2">
                {/* Primary service card matching reference image */}
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-accent bg-accent-soft/20 flex items-start gap-4">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <CheckIcon size={14} />
                  </span>
                  <div className="flex-1">
                    <strong className="block text-base font-semibold text-ink">
                      Reel production
                    </strong>
                    <p className="text-xs sm:text-sm text-ink-soft mt-1 leading-relaxed">
                      Shoot, edit, and delivery by the Pocket Reels crew.
                    </p>
                  </div>
                </div>

                {/* Package Type Selection */}
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-3">
                    Select coverage package:
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {packageOptions.map((pkg) => {
                      const isSelected = fields.packageType === pkg.name;
                      return (
                        <label
                          key={pkg.id}
                          className={`relative flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-accent bg-accent-soft/30 shadow-xs ring-1 ring-accent"
                              : "border-line bg-surface hover:border-ink/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="packageType"
                            value={pkg.name}
                            checked={isSelected}
                            onChange={(e) => update("packageType", e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                  isSelected
                                    ? "border-accent bg-accent text-white"
                                    : "border-line bg-paper text-transparent"
                                }`}
                              >
                                ✓
                              </span>
                              <strong className="text-xs sm:text-sm font-semibold text-ink">
                                {pkg.name}
                              </strong>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-paper border border-line text-ink">
                              {pkg.tag}
                            </span>
                          </div>
                          <small className="text-[11px] text-ink leading-relaxed font-normal pl-6">
                            {pkg.desc}
                          </small>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              {errors.packageType ? (
                <span className="field__error mt-2">{errors.packageType}</span>
              ) : null}
            </fieldset>
          ) : null}

          {/* ─── Step 1: Date of Event ─── */}
          {step === 1 ? (
            <fieldset className="booking-step">
              <legend>
                <span>Step 2</span>
                DATE OF EVENT *
              </legend>
              <p className="booking-step__intro">
                Choose the requested event or shoot date.
              </p>
              <div className="field">
                <label htmlFor="appointment-date">Preferred date</label>
                <input
                  id="appointment-date"
                  type="date"
                  value={fields.date}
                  min={localDateInput(today)}
                  max={localDateInput(latest)}
                  onChange={(event) => update("date", event.target.value)}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? "date-error" : "date-note"}
                  required
                />
                {errors.date ? (
                  <span id="date-error" className="field__error">
                    {errors.date}
                  </span>
                ) : (
                  <span id="date-note" className="field__note">
                    Dates can be requested up to twelve months ahead.
                  </span>
                )}
              </div>
            </fieldset>
          ) : null}

          {/* ─── Step 2: Preferred Time to Call ─── */}
          {step === 2 ? (
            <fieldset className="booking-step">
              <legend>
                <span>Step 3</span>
                PREFERRED TIME TO CALL
              </legend>
              <p className="booking-step__intro">
                When is the best window for our producer to reach out and confirm details?
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2 mt-4 mb-5">
                {timeOptions.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${
                      fields.preferredTimeToCall === opt
                        ? "border-accent bg-accent-soft/30 font-medium text-ink"
                        : "border-line bg-surface hover:border-ink/30 text-ink font-medium"
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferredTimeToCall"
                      value={opt}
                      checked={fields.preferredTimeToCall === opt}
                      onChange={(e) => update("preferredTimeToCall", e.target.value)}
                      className="accent-accent"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>

              <div className="field">
                <label htmlFor="appointment-time">Preferred time (exact slot if specific)</label>
                <input
                  id="appointment-time"
                  type="time"
                  step="1800"
                  value={fields.time}
                  onChange={(event) => update("time", event.target.value)}
                  aria-invalid={Boolean(errors.time)}
                  aria-describedby={errors.time ? "time-error" : "time-note"}
                  required
                />
                {errors.time ? (
                  <span id="time-error" className="field__error">
                    {errors.time}
                  </span>
                ) : (
                  <span id="time-note" className="field__note">
                    Use your local timezone for the call.
                  </span>
                )}
              </div>
            </fieldset>
          ) : null}

          {/* ─── Step 3: Contact & Location ─── */}
          {step === 3 ? (
            <fieldset className="booking-step">
              <legend>
                <span>Step 4</span>
                CONTACT &amp; LOCATION *
              </legend>
              <p className="booking-step__intro">
                Provide your contact details and where your event takes place.
              </p>
              <div className="field-grid">
                <div className="field field--full">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="e.g. Maya Lin (Full Name)"
                    value={fields.name}
                    onChange={(event) => update("name", event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    required
                  />
                  {errors.name ? (
                    <span id="name-error" className="field__error">
                      {errors.name}
                    </span>
                  ) : null}
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+1 (469) 555-0199"
                    value={fields.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    required
                  />
                  {errors.phone ? (
                    <span id="phone-error" className="field__error">
                      {errors.phone}
                    </span>
                  ) : null}
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@company.com"
                    value={fields.email}
                    onChange={(event) => update("email", event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    required
                  />
                  {errors.email ? (
                    <span id="email-error" className="field__error">
                      {errors.email}
                    </span>
                  ) : null}
                </div>

                <div className="field">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    name="country"
                    placeholder="United States"
                    value={fields.country}
                    onChange={(event) => update("country", event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="state">State / Region</label>
                  <input
                    id="state"
                    name="state"
                    placeholder="Texas / NY / Illinois"
                    value={fields.state}
                    onChange={(event) => update("state", event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    placeholder="Dallas / NYC / Chicago"
                    value={fields.city}
                    onChange={(event) => update("city", event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="locationVenue">Location / Venue</label>
                  <input
                    id="locationVenue"
                    name="locationVenue"
                    placeholder="The Ritz-Carlton / Outdoor Stage"
                    value={fields.locationVenue}
                    onChange={(event) => update("locationVenue", event.target.value)}
                  />
                </div>
              </div>
            </fieldset>
          ) : null}

          {/* ─── Step 4: Event Details ─── */}
          {step === 4 ? (
            <fieldset className="booking-step">
              <legend>
                <span>Step 5</span>
                EVENT DETAILS *
              </legend>
              <p className="booking-step__intro">
                Share the schedule, vibe, music style, specific shots, or reel deliverables you have in mind.
              </p>
              <div className="field">
                <label htmlFor="project-details">
                  Tell us a little about your project / event details *
                </label>
                <textarea
                  id="project-details"
                  rows={5}
                  maxLength={3000}
                  value={fields.eventDetails || fields.projectDetails}
                  onChange={(event) => {
                    update("eventDetails", event.target.value);
                  }}
                  aria-invalid={Boolean(errors.eventDetails || errors.projectDetails)}
                  aria-describedby="project-count"
                  placeholder="Describe your event, schedule, number of reels needed, special moments, or key deliverables..."
                />
                <span id="project-count" className="field__note field__count">
                  {(fields.eventDetails || fields.projectDetails).length} / 3,000
                </span>
                {errors.eventDetails || errors.projectDetails ? (
                  <span className="field__error">
                    {errors.eventDetails || errors.projectDetails}
                  </span>
                ) : null}
              </div>
            </fieldset>
          ) : null}

          {/* ─── Step 5: Review & Submit ─── */}
          {step === 5 ? (
            <fieldset className="booking-step booking-summary">
              <legend>
                <span>Step 6</span>
                REVIEW &amp; SUBMIT ENQUIRY
              </legend>
              <p className="booking-step__intro">
                Review your enquiry before submitting. Our crew will follow up within 24 hours.
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-paper/60 p-4 rounded-xl border border-line">
                <div>
                  <dt className="text-xs uppercase font-bold text-muted">Package Type</dt>
                  <dd className="text-sm font-semibold text-ink mt-0.5">{fields.packageType}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase font-bold text-muted">Date of Event</dt>
                  <dd className="text-sm font-semibold text-ink mt-0.5">{displayDate(fields.date)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase font-bold text-muted">Preferred Time to Call</dt>
                  <dd className="text-sm font-semibold text-ink mt-0.5">
                    {fields.preferredTimeToCall || displayTime(fields.time)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase font-bold text-muted">Full Name</dt>
                  <dd className="text-sm font-semibold text-ink mt-0.5">{fields.name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase font-bold text-muted">Contact Number</dt>
                  <dd className="text-sm font-semibold text-ink mt-0.5">{fields.phone}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase font-bold text-muted">Email Address</dt>
                  <dd className="text-sm font-semibold text-ink mt-0.5">{fields.email}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase font-bold text-muted">Location / City</dt>
                  <dd className="text-sm font-semibold text-ink mt-0.5">
                    {[fields.locationVenue, fields.city, fields.state, fields.country]
                      .filter(Boolean)
                      .join(", ") || "Not specified"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase font-bold text-muted">Event Details</dt>
                  <dd className="text-sm text-ink-soft mt-0.5 whitespace-pre-wrap">
                    {fields.eventDetails || fields.projectDetails || "Standard enquiry"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 p-4 rounded-xl bg-paper/80 border border-line flex flex-col gap-3 text-xs text-ink-soft">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="ageConfirmed"
                    checked={fields.ageConfirmed}
                    onChange={(e) => update("ageConfirmed", e.target.checked)}
                    aria-invalid={Boolean(errors.ageConfirmed)}
                    aria-describedby={errors.ageConfirmed ? "age-error" : undefined}
                    className="mt-0.5 rounded border-line text-accent focus:ring-accent accent-accent w-4 h-4"
                  />
                  <span>
                    I confirm that I am at least 18 years of age and authorized to book services for this event.
                  </span>
                </label>
                {errors.ageConfirmed ? (
                  <span id="age-error" className="field__error">
                    {errors.ageConfirmed}
                  </span>
                ) : null}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={fields.termsAccepted}
                    onChange={(e) => update("termsAccepted", e.target.checked)}
                    aria-invalid={Boolean(errors.termsAccepted)}
                    aria-describedby={errors.termsAccepted ? "terms-error" : undefined}
                    className="mt-0.5 rounded border-line text-accent focus:ring-accent accent-accent w-4 h-4"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="/terms" target="_blank" rel="noreferrer" className="text-accent underline font-semibold">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" target="_blank" rel="noreferrer" className="text-accent underline font-semibold">
                      Privacy Policy
                    </a>
                    . Pocket Reels 360 may contact me via email or phone regarding this booking inquiry.
                  </span>
                </label>
                {errors.termsAccepted ? (
                  <span id="terms-error" className="field__error">
                    {errors.termsAccepted}
                  </span>
                ) : null}
              </div>

              <p className="booking-summary__note mt-3 text-[11px] text-muted">
                🛡️ Zero spam guarantee · No payment collected today · All inquiries reviewed within 24 hours.
              </p>
            </fieldset>
          ) : null}

          <div className="form-honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={fields.website}
              onChange={(event) => update("website", event.target.value)}
            />
          </div>

          {submitError ? (
            <div className="booking-form__error" role="alert">
              {submitError}
            </div>
          ) : null}
        </div>

        <div className="booking-form__footer flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-line mt-6">
          {step > 0 ? (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setStep((current) => current - 1);
                setSubmitError("");
              }}
              disabled={submitting}
            >
              <ArrowLeftIcon size={17} />
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="button button--dark px-8 py-3 font-semibold text-sm tracking-wide"
            disabled={submitting}
          >
            {submitting
              ? "Submitting enquiry…"
              : step === steps.length - 1
                ? "Confirm appointment"
                : "Continue"}
            {!submitting ? <ArrowRightIcon size={17} /> : null}
          </button>
        </div>
      </form>

      {/* ─── Bottom trust highlights ─── */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-line/60 text-xs text-ink-soft mt-6">
        <span>⚡ 24hr response time</span>
        <span>•</span>
        <span>💎 Clear packages</span>
        <span>•</span>
        <span>📱 Shot on iPhone</span>
      </div>
    </div>
  );
}
