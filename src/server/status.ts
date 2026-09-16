import "server-only";

import { env } from "@/env";
import { getSupabaseClient } from "@/lib/supabase";
import {
  canEmailClients,
  emailTransport,
  notifyAddress,
  resendIsSandbox,
  senderAddress,
} from "@/server/appointments/email";
import { appointmentStorageHealth } from "@/server/appointments/repository";
import { assistantConfigured } from "@/server/assistant/client";

/**
 * Non-secret snapshot of what this deployment is actually configured to do.
 * Surfaced on /api/health and in the admin "System" panel so nobody has to
 * guess which environment variables Vercel picked up.
 */
export type SystemStatus = {
  ok: boolean;
  environment: "development" | "test" | "production";
  siteUrl: string;
  storage: {
    kind: "supabase" | "postgres" | "local-file";
    ready: boolean;
    durable: boolean;
    schemaUpToDate: boolean | null;
    note: string;
  };
  email: {
    transport: "gmail" | "resend" | "none";
    canEmailClients: boolean;
    sender: string | null;
    notify: string | null;
    note: string;
  };
  assistant: { configured: boolean; model: string };
  problems: string[];
};

async function supabaseSchemaUpToDate(): Promise<boolean | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { error } = await supabase.from("appointments").select("city").limit(1);
  return !error;
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const problems: string[] = [];

  let storageHealth: {
    ready: boolean;
    storage: "supabase" | "postgres" | "local-file";
  };
  try {
    storageHealth = await appointmentStorageHealth();
  } catch (error) {
    console.error("Storage health check failed", error);
    storageHealth = {
      ready: false,
      storage: env.DATABASE_URL ? "postgres" : "local-file",
    };
  }

  const schemaUpToDate =
    storageHealth.storage === "supabase" ? await supabaseSchemaUpToDate() : null;

  const durable = storageHealth.storage !== "local-file";
  let storageNote = "";
  if (storageHealth.storage === "local-file") {
    storageNote = process.env.VERCEL
      ? "Bookings are written to /tmp and disappear on every deploy. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel."
      : "Bookings are stored in data/appointments.json (development only).";
    if (process.env.VERCEL) problems.push("No database connected on Vercel.");
  } else if (storageHealth.storage === "supabase") {
    storageNote = storageHealth.ready
      ? schemaUpToDate
        ? "Connected to Supabase; schema is current."
        : "Connected to Supabase, but migration 002 has not been run. Package, call window, location, and event details are folded into the notes column until it is."
      : "Supabase credentials are set but the appointments table could not be read. Check the key and that migration 001 has been run.";
    if (!storageHealth.ready) problems.push("Supabase is configured but unreachable.");
    else if (schemaUpToDate === false) problems.push("Supabase schema needs migration 002.");
  } else {
    storageNote = storageHealth.ready
      ? "Connected to PostgreSQL."
      : "DATABASE_URL is set but the database could not be reached.";
    if (!storageHealth.ready) problems.push("PostgreSQL is configured but unreachable.");
  }

  const transport = emailTransport();
  let emailNote = "";
  if (transport === "none") {
    emailNote = "No email transport. Add GMAIL_USER + GMAIL_APP_PASSWORD, or RESEND_API_KEY + a verified APPOINTMENT_FROM_EMAIL.";
    problems.push("Email is not configured; clients receive nothing.");
  } else if (transport === "resend" && resendIsSandbox()) {
    emailNote = "Resend sandbox sender (onboarding@resend.dev) can only deliver to the Resend account owner. Clients will NOT receive confirmations or decisions.";
    problems.push("Resend sandbox sender cannot email clients.");
  } else if (transport === "gmail") {
    emailNote = `Sending from ${env.GMAIL_USER} via Gmail SMTP.`;
  } else {
    emailNote = `Sending via Resend from ${env.APPOINTMENT_FROM_EMAIL}.`;
  }
  if (!notifyAddress()) problems.push("APPOINTMENT_NOTIFY_EMAIL is not set; the crew gets no booking alerts.");

  if (!assistantConfigured()) {
    problems.push("GROQ_API_KEY is not set; the assistant answers from the built-in knowledge base only.");
  }

  return {
    ok: problems.length === 0,
    environment: env.NODE_ENV,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    storage: {
      kind: storageHealth.storage,
      ready: storageHealth.ready,
      durable,
      schemaUpToDate,
      note: storageNote,
    },
    email: {
      transport,
      canEmailClients: canEmailClients(),
      sender: senderAddress(),
      notify: notifyAddress(),
      note: emailNote,
    },
    assistant: { configured: assistantConfigured(), model: env.ASSISTANT_MODEL },
    problems,
  };
}
