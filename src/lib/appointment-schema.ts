import { z } from "zod";

const cleanText = (value: string) =>
  value.replace(/\0/g, "").replace(/\s+/g, " ").trim();

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Single source of truth for the package label used when none was sent. */
export const DEFAULT_PACKAGE_TYPE = "Wedding & Reception Reels";

export const appointmentSchema = z.object({
  service: z.string().default("reel-production"),
  packageType: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(1, "Select a package type").max(100))
    .optional()
    .default(DEFAULT_PACKAGE_TYPE),
  date: z
    .string()
    .regex(datePattern, "Choose a valid date")
    .refine((value) => {
      const date = new Date(`${value}T12:00:00Z`);
      return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
    }, "Choose a valid date"),
  time: z
    .string()
    .regex(timePattern, "Choose a valid time")
    .optional()
    .default("12:00"),
  name: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(2, "Enter your full name").max(100, "Name is too long")),
  phone: z
    .string()
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(7, "Enter a valid phone number")
        .max(24, "Phone number is too long")
        .regex(/^[+\d().\-\s]+$/, "Enter a valid phone number")
        .refine(
          (value) => value.replace(/\D/g, "").length >= 7,
          "Enter a valid phone number",
        ),
    ),
  email: z
    .string()
    .transform((value) => cleanText(value).toLowerCase())
    .pipe(z.string().email("Enter a valid email address").max(254)),
  country: z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(80))
    .optional()
    .default("United States"),
  state: z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(80))
    .optional()
    .default(""),
  city: z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(80))
    .optional()
    .default(""),
  locationVenue: z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(200))
    .optional()
    .default(""),
  preferredTimeToCall: z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(100))
    .optional()
    .default("Anytime"),
  eventDetails: z
    .string()
    .transform((value) => value.replace(/\0/g, "").trim())
    .pipe(z.string().max(3000, "Keep details under 3,000 characters"))
    .optional()
    .default(""),
  projectDetails: z
    .string()
    .transform((value) => value.replace(/\0/g, "").trim())
    .pipe(z.string().max(3000, "Keep project details under 3,000 characters"))
    .optional()
    .default(""),
  website: z.string().max(0).optional().default(""),
  idempotencyKey: z.string().uuid(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export function isBookableDate(value: string, now = new Date()) {
  if (!datePattern.test(value)) return false;
  const selected = new Date(`${value}T23:59:59.999Z`);
  const latest = new Date(now);
  latest.setUTCFullYear(latest.getUTCFullYear() + 1);
  return selected >= now && selected <= latest;
}

export function serviceLabel(service: string) {
  if (service === "reel-production") return "Reel production";
  return service || "Reel production";
}

