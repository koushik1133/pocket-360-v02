"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DownloadIcon,
  InstagramIcon,
  MailIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { brand, primaryService } from "@/content/site";
import { whatsappUrl } from "@/lib/contact-links";

type BookingFields = {
  service: "reel-production";
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  projectDetails: string;
  website: string;
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
  "Service",
  "Date",
  "Time",
  "Details",
  "Project",
  "Confirm",
] as const;

const initialFields: BookingFields = {
  service: "reel-production",
  date: "",
  time: "",
  name: "",
  phone: "",
  email: "",
  projectDetails: "",
  website: "",
};

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
  if (!value) return "Not selected";
  const [hours = "0", minutes = "00"] = value.split(":");
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, Number(hours), Number(minutes)));
}

function validateStep(step: number, fields: BookingFields): FieldErrors {
  const errors: FieldErrors = {};

  if (step === 1) {
    if (!fields.date) errors.date = "Choose a preferred date.";
    else if (fields.date < localDateInput(new Date())) {
      errors.date = "Choose today or a future date.";
    }
  }

  if (step === 2 && !/^([01]\d|2[0-3]):[0-5]\d$/.test(fields.time)) {
    errors.time = "Choose a preferred time.";
  }

  if (step === 3) {
    if (fields.name.trim().length < 2) errors.name = "Enter your name.";
    const phoneDigits = fields.phone.replace(/\D/g, "");
    if (phoneDigits.length < 7) errors.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      errors.email = "Enter a valid email.";
    }
  }

  if (step === 4 && fields.projectDetails.length > 2000) {
    errors.projectDetails = "Keep project details under 2,000 characters.";
  }

  return errors;
}

function structuredMessage(fields: BookingFields, reference?: string) {
  return [
    "Hi Pocket Reels 360, I'd like to discuss this appointment request:",
    "",
    `Name: ${fields.name}`,
    `Service: ${primaryService.name}`,
    `Date: ${displayDate(fields.date)}`,
    `Preferred time: ${displayTime(fields.time)}`,
    `Phone: ${fields.phone}`,
    `Email: ${fields.email}`,
    `Project details: ${fields.projectDetails || "Not provided"}`,
    reference ? `Reference: ${reference}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function downloadCalendar(fields: BookingFields, reference: string) {
  const compactDate = fields.date.replaceAll("-", "");
  const compactTime = `${fields.time.replace(":", "")}00`;
  const escape = (value: string) =>
    value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pocket Reels 360//Appointment//EN",
    "BEGIN:VEVENT",
    `UID:${reference}@pocketreels360`,
    `DTSTAMP:${new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${compactDate}T${compactTime}`,
    "SUMMARY:Pocket Reels 360 appointment request",
    `DESCRIPTION:${escape(`Preferred time for ${primaryService.name}. Reference: ${reference}`)}`,
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const href = URL.createObjectURL(
    new Blob([calendar], { type: "text/calendar;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = "pocket-reels-360-appointment.ics";
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
    setFields((current) => ({ ...current, [key]: value }));
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
      ...validateStep(1, fields),
      ...validateStep(2, fields),
      ...validateStep(3, fields),
      ...validateStep(4, fields),
    };
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      const firstStep = finalErrors.date
        ? 1
        : finalErrors.time
          ? 2
          : finalErrors.name || finalErrors.phone || finalErrors.email
            ? 3
            : 4;
      setStep(firstStep);
      focusFirstError();
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    idempotencyKey.current ||= crypto.randomUUID();

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          idempotencyKey: idempotencyKey.current,
        }),
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
        if (response.status === 409) setStep(2);
        setSubmitError(
          body?.detail ??
            "We couldn't save the appointment. Please try again.",
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
      ? `mailto:${contactEmail}?subject=${encodeURIComponent("Pocket Reels 360 appointment")}&body=${encodeURIComponent(structuredMessage(fields, success.id))}`
      : null;

    return (
      <section className="booking-success" aria-live="polite">
        <span className="booking-success__check">
          <CheckIcon size={32} />
        </span>
        <p className="eyebrow">Request received</p>
        <h1>You&apos;re all set.</h1>
        <p className="booking-success__lede">
          Your appointment request has been received. The crew will contact you
          to confirm the details.
        </p>
        <div className="booking-success__date">
          <div>
            <span>Date</span>
            <strong>{displayDate(fields.date)}</strong>
          </div>
          <div>
            <span>Preferred time</span>
            <strong>{displayTime(fields.time)}</strong>
          </div>
        </div>
        <p className="booking-success__email">
          {success.emailSent
            ? `A confirmation email was sent to ${fields.email}.`
            : success.replayed
              ? "This request was already saved."
              : "Your request was saved, but the confirmation email could not be sent. Keep the reference below."}
        </p>
        <p className="booking-success__reference">Reference: {success.id}</p>
        <div className="booking-success__actions">
          <button
            type="button"
            className="button button--dark"
            onClick={() => downloadCalendar(fields, success.id)}
          >
            <DownloadIcon size={17} />
            Add to calendar
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
        {step === 0 ? (
          <fieldset className="booking-step">
            <legend>
              <span>Step 1</span>
              Select service
            </legend>
            <p className="booking-step__intro">
              Choose the Pocket Reels service currently shown on the brand&apos;s
              public profile.
            </p>
            <label className="service-option">
              <input
                type="radio"
                name="service"
                value={primaryService.id}
                checked
                readOnly
              />
              <span className="service-option__check">
                <CheckIcon size={17} />
              </span>
              <span>
                <strong>{primaryService.name}</strong>
                <small>{primaryService.description}</small>
              </span>
            </label>
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset className="booking-step">
            <legend>
              <span>Step 2</span>
              Select date
            </legend>
            <p className="booking-step__intro">
              Choose a preferred date. The crew will confirm availability.
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

        {step === 2 ? (
          <fieldset className="booking-step">
            <legend>
              <span>Step 3</span>
              Select time
            </legend>
            <p className="booking-step__intro">
              Add a preferred time. This is a request, not a claim of published
              availability.
            </p>
            <div className="field">
              <label htmlFor="appointment-time">Preferred time</label>
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
                  Use the local time for your project location.
                </span>
              )}
            </div>
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset className="booking-step">
            <legend>
              <span>Step 4</span>
              Your details
            </legend>
            <p className="booking-step__intro">
              Tell the crew how to reach you about the request.
            </p>
            <div className="field-grid">
              <div className="field field--full">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
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
            </div>
          </fieldset>
        ) : null}

        {step === 4 ? (
          <fieldset className="booking-step">
            <legend>
              <span>Step 5</span>
              Project details
            </legend>
            <p className="booking-step__intro">
              Share the moment, location, and anything useful for the crew.
            </p>
            <div className="field">
              <label htmlFor="project-details">
                Tell us a little about your project{" "}
                <span className="field__optional">Optional</span>
              </label>
              <textarea
                id="project-details"
                rows={7}
                maxLength={2000}
                value={fields.projectDetails}
                onChange={(event) =>
                  update("projectDetails", event.target.value)
                }
                aria-invalid={Boolean(errors.projectDetails)}
                aria-describedby="project-count"
                placeholder="What are you creating, where is it happening, and what should the reel capture?"
              />
              <span id="project-count" className="field__note field__count">
                {fields.projectDetails.length} / 2,000
              </span>
            </div>
          </fieldset>
        ) : null}

        {step === 5 ? (
          <fieldset className="booking-step booking-summary">
            <legend>
              <span>Step 6</span>
              Confirm appointment
            </legend>
            <p className="booking-step__intro">
              Review your request before sending it to Pocket Reels 360.
            </p>
            <dl>
              <div>
                <dt>Service</dt>
                <dd>{primaryService.name}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{displayDate(fields.date)}</dd>
              </div>
              <div>
                <dt>Preferred time</dt>
                <dd>{displayTime(fields.time)}</dd>
              </div>
              <div>
                <dt>Name</dt>
                <dd>{fields.name}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{fields.phone}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{fields.email}</dd>
              </div>
              <div>
                <dt>Project details</dt>
                <dd>{fields.projectDetails || "Not provided"}</dd>
              </div>
            </dl>
            <p className="booking-summary__note">
              Sending this form creates an appointment request. Pocket Reels
              will confirm the final date and time with you.
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

      <div className="booking-form__footer">
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
          className="button button--dark"
          disabled={submitting}
        >
          {submitting
            ? "Sending request…"
            : step === steps.length - 1
              ? "Confirm appointment"
              : "Continue"}
          {!submitting ? <ArrowRightIcon size={17} /> : null}
        </button>
      </div>
    </form>
  );
}
