import "server-only";

import { z } from "zod";

function blankToUndefined(value: string | undefined) {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function withHttps(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function resolveSiteUrl(source: NodeJS.ProcessEnv) {
  const explicit = blankToUndefined(source.NEXT_PUBLIC_SITE_URL);
  if (explicit) return withHttps(explicit);

  const vercel =
    blankToUndefined(source.VERCEL_PROJECT_PRODUCTION_URL) ??
    blankToUndefined(source.VERCEL_URL);
  if (vercel) return withHttps(vercel);

  return undefined;
}

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine(
    (value) => value === undefined || z.string().email().safeParse(value).success,
    { message: "Must be a valid email" },
  );

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || value.startsWith("postgres"),
      "DATABASE_URL must start with postgres",
    ),
  ALLOW_FILE_APPOINTMENTS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  RESEND_API_KEY: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  APPOINTMENT_FROM_EMAIL: optionalEmail,
  APPOINTMENT_NOTIFY_EMAIL: optionalEmail,
  APPOINTMENT_FROM_NAME: z.string().min(1).default("Pocket Reels 360"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const digits = value.replace(/[^\d]/g, "");
      return digits.length >= 10 ? digits : undefined;
    }),
  NEXT_PUBLIC_CONTACT_EMAIL: optionalEmail,
  NEXT_PUBLIC_CONTACT_PHONE: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: resolveSiteUrl(process.env),
  DATABASE_URL: blankToUndefined(process.env.DATABASE_URL),
  ALLOW_FILE_APPOINTMENTS: blankToUndefined(process.env.ALLOW_FILE_APPOINTMENTS),
  RESEND_API_KEY: blankToUndefined(process.env.RESEND_API_KEY),
  APPOINTMENT_FROM_EMAIL: blankToUndefined(process.env.APPOINTMENT_FROM_EMAIL),
  APPOINTMENT_NOTIFY_EMAIL: blankToUndefined(
    process.env.APPOINTMENT_NOTIFY_EMAIL,
  ),
  APPOINTMENT_FROM_NAME: blankToUndefined(process.env.APPOINTMENT_FROM_NAME),
  NEXT_PUBLIC_WHATSAPP_NUMBER: blankToUndefined(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  ),
  NEXT_PUBLIC_CONTACT_EMAIL: blankToUndefined(
    process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  ),
  NEXT_PUBLIC_CONTACT_PHONE: blankToUndefined(
    process.env.NEXT_PUBLIC_CONTACT_PHONE,
  ),
});

if (!parsed.success) {
  console.error("Invalid environment", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsed.data;
export type Env = z.infer<typeof schema>;
