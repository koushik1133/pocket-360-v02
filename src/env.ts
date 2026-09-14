import "server-only";

import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()
  .refine(
    (value) => value === undefined || z.string().email().safeParse(value).success,
    { message: "Must be a valid email" },
  );

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
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
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  APPOINTMENT_FROM_EMAIL: optionalEmail,
  APPOINTMENT_NOTIFY_EMAIL: optionalEmail,
  APPOINTMENT_FROM_NAME: z.string().min(1).default("Pocket Reels 360"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const digits = value.replace(/[^\d]/g, "");
      return digits.length >= 10 ? digits : undefined;
    }),
  NEXT_PUBLIC_CONTACT_EMAIL: optionalEmail,
  NEXT_PUBLIC_CONTACT_PHONE: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  ALLOW_FILE_APPOINTMENTS: process.env.ALLOW_FILE_APPOINTMENTS,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  APPOINTMENT_FROM_EMAIL: process.env.APPOINTMENT_FROM_EMAIL,
  APPOINTMENT_NOTIFY_EMAIL: process.env.APPOINTMENT_NOTIFY_EMAIL,
  APPOINTMENT_FROM_NAME: process.env.APPOINTMENT_FROM_NAME,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_CONTACT_PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE,
});

if (!parsed.success) {
  console.error("Invalid environment", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsed.data;
export type Env = z.infer<typeof schema>;
