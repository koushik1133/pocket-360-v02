import { z } from "zod";

const cleanText = (value: string) =>
  value.replace(/\0/g, "").replace(/\s+/g, " ").trim();

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const appointmentSchema = z.object({
  service: z.literal("reel-production"),
  date: z
    .string()
    .regex(datePattern, "Choose a valid date")
    .refine((value) => {
      const date = new Date(`${value}T12:00:00Z`);
      return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
    }, "Choose a valid date"),
  time: z.string().regex(timePattern, "Choose a valid time"),
  name: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(2, "Enter your name").max(80, "Name is too long")),
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
    .pipe(z.string().email("Enter a valid email").max(254)),
  projectDetails: z
    .string()
    .transform((value) => value.replace(/\0/g, "").trim())
    .pipe(z.string().max(2000, "Keep project details under 2,000 characters"))
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

export function serviceLabel(service: AppointmentInput["service"]) {
  if (service === "reel-production") return "Reel production";
  return service satisfies never;
}
