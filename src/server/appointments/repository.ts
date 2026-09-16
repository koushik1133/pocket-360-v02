import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import type { AppointmentInput } from "@/lib/appointment-schema";
import { getSupabaseClient } from "@/lib/supabase";
import { env } from "@/env";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type AppointmentRecord = AppointmentInput & {
  id: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type CreateAppointmentResult =
  | { ok: true; record: AppointmentRecord; created: boolean }
  | { ok: false; code: "SLOT_TAKEN" };

export class BookingStorageUnavailableError extends Error {
  constructor() {
    super("Booking storage is not configured");
    this.name = "BookingStorageUnavailableError";
  }
}

// ─── Postgres (legacy / direct) ──────────────────────────────────────────────

const globalForDatabase = globalThis as typeof globalThis & {
  pocketReelsSql?: ReturnType<typeof postgres>;
};

function database() {
  if (!env.DATABASE_URL) return null;
  globalForDatabase.pocketReelsSql ??= postgres(env.DATABASE_URL, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: true,
  });
  return globalForDatabase.pocketReelsSql;
}

// ─── Local file fallback ──────────────────────────────────────────────────────

// On Vercel / serverless environments, root filesystem is read-only; /tmp is writable.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const localPath = isServerless
  ? path.join("/tmp", "appointments.json")
  : path.join(process.cwd(), "data", "appointments.json");
let localQueue: Promise<void> = Promise.resolve();

async function withLocalLock<T>(task: () => Promise<T>): Promise<T> {
  const result = localQueue.then(task, task);
  localQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function readLocalAppointments(): Promise<AppointmentRecord[]> {
  try {
    const value: unknown = JSON.parse(await readFile(localPath, "utf8"));
    return Array.isArray(value) ? (value as AppointmentRecord[]) : [];
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
}

async function createLocalAppointment(
  input: AppointmentInput,
): Promise<CreateAppointmentResult> {
  if (env.NODE_ENV === "production" && !env.ALLOW_FILE_APPOINTMENTS) {
    throw new BookingStorageUnavailableError();
  }

  return withLocalLock(async () => {
    const appointments = await readLocalAppointments();
    const replay = appointments.find(
      (appointment) => appointment.idempotencyKey === input.idempotencyKey,
    );
    if (replay) return { ok: true, record: replay, created: false };

    const unavailable = appointments.some(
      (appointment) =>
        appointment.service === input.service &&
        appointment.date === input.date &&
        appointment.time === input.time &&
        (appointment.status === "pending" ||
          appointment.status === "confirmed"),
    );
    if (unavailable) return { ok: false, code: "SLOT_TAKEN" };

    const record: AppointmentRecord = {
      ...input,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    appointments.push(record);

    await mkdir(path.dirname(localPath), { recursive: true });
    const temporaryPath = `${localPath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(appointments, null, 2), {
      mode: 0o600,
    });
    await rename(temporaryPath, localPath);

    return { ok: true, record, created: true };
  });
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

type SupabaseAppointmentRow = {
  id: string;
  service: AppointmentInput["service"];
  appointment_date: string;
  appointment_time: string;
  name: string;
  phone: string;
  email: string;
  project_details: string;
  status: AppointmentStatus;
  created_at: string;
  idempotency_key: string;
};

function fromSupabaseRow(row: SupabaseAppointmentRow): AppointmentRecord {
  return {
    id: row.id,
    service: row.service,
    packageType: "Wedding & Event Reels",
    date: row.appointment_date,
    time: row.appointment_time.slice(0, 5),
    name: row.name,
    phone: row.phone,
    email: row.email,
    country: "United States",
    state: "",
    city: "",
    locationVenue: "",
    preferredTimeToCall: "Anytime",
    eventDetails: row.project_details,
    projectDetails: row.project_details,
    status: row.status,
    createdAt: row.created_at,
    idempotencyKey: row.idempotency_key,
    website: "",
  };
}

async function createSupabaseAppointment(
  input: AppointmentInput,
): Promise<CreateAppointmentResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return createLocalAppointment(input);

  try {
    // Idempotency: check for existing record first
    const { data: existing } = await supabase
      .from("appointments")
      .select("*")
      .eq("idempotency_key", input.idempotencyKey)
      .maybeSingle<SupabaseAppointmentRow>();

    if (existing) {
      return { ok: true, record: fromSupabaseRow(existing), created: false };
    }

    // Slot conflict check
    const { data: conflict } = await supabase
      .from("appointments")
      .select("id")
      .eq("service", input.service)
      .eq("appointment_date", input.date)
      .eq("appointment_time", input.time)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (conflict) {
      return { ok: false, code: "SLOT_TAKEN" };
    }

    const { data: inserted, error } = await supabase
      .from("appointments")
      .insert({
        service: input.service,
        appointment_date: input.date,
        appointment_time: input.time,
        name: input.name,
        phone: input.phone,
        email: input.email,
        project_details: input.projectDetails,
        status: "pending",
        idempotency_key: input.idempotencyKey,
      })
      .select("*")
      .single<SupabaseAppointmentRow>();

    if (error || !inserted) {
      console.error("[supabase] createAppointment error:", error);
      return createLocalAppointment(input);
    }

    return { ok: true, record: fromSupabaseRow(inserted), created: true };
  } catch (err) {
    console.error("[supabase] unexpected exception in createSupabaseAppointment:", err);
    return createLocalAppointment(input);
  }
}

// ─── Postgres helpers ─────────────────────────────────────────────────────────

type DatabaseAppointment = {
  id: string;
  service: AppointmentInput["service"];
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  projectDetails: string;
  status: AppointmentStatus;
  createdAt: string;
  idempotencyKey: string;
};

function toRecord(row: DatabaseAppointment): AppointmentRecord {
  return {
    id: row.id,
    service: row.service,
    packageType: "Wedding & Event Reels",
    date: row.date,
    time: row.time.slice(0, 5),
    name: row.name,
    phone: row.phone,
    email: row.email,
    country: "United States",
    state: "",
    city: "",
    locationVenue: "",
    preferredTimeToCall: "Anytime",
    eventDetails: row.projectDetails,
    projectDetails: row.projectDetails,
    status: row.status,
    createdAt: row.createdAt,
    idempotencyKey: row.idempotencyKey,
    website: "",
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Priority: Supabase → postgres → local-file
 */
export async function createAppointment(
  input: AppointmentInput,
): Promise<CreateAppointmentResult> {
  // Supabase takes priority when configured
  if (getSupabaseClient()) return createSupabaseAppointment(input);

  const sql = database();
  if (!sql) return createLocalAppointment(input);

  const inserted = await sql<DatabaseAppointment[]>`
    insert into appointments (
      service,
      appointment_date,
      appointment_time,
      name,
      phone,
      email,
      project_details,
      status,
      idempotency_key
    )
    values (
      ${input.service},
      ${input.date},
      ${input.time},
      ${input.name},
      ${input.phone},
      ${input.email},
      ${input.projectDetails},
      'pending',
      ${input.idempotencyKey}
    )
    on conflict do nothing
    returning
      id,
      service,
      appointment_date::text as date,
      appointment_time::text as time,
      name,
      phone,
      email,
      project_details as "projectDetails",
      status,
      created_at::text as "createdAt",
      idempotency_key as "idempotencyKey"
  `;

  const createdRow = inserted[0];
  if (createdRow) {
    return { ok: true, record: toRecord(createdRow), created: true };
  }

  const replayed = await sql<DatabaseAppointment[]>`
    select
      id,
      service,
      appointment_date::text as date,
      appointment_time::text as time,
      name,
      phone,
      email,
      project_details as "projectDetails",
      status,
      created_at::text as "createdAt",
      idempotency_key as "idempotencyKey"
    from appointments
    where idempotency_key = ${input.idempotencyKey}
    limit 1
  `;

  const replayedRow = replayed[0];
  if (replayedRow) {
    return { ok: true, record: toRecord(replayedRow), created: false };
  }

  return { ok: false, code: "SLOT_TAKEN" };
}

export async function listAppointments(): Promise<AppointmentRecord[]> {
  // Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<SupabaseAppointmentRow[]>();

      if (!error && data) {
        return data.map(fromSupabaseRow);
      }
      console.error("[supabase] listAppointments error, falling back:", error);
    } catch (err) {
      console.error("[supabase] listAppointments exception, falling back:", err);
    }
  }

  // Postgres
  const sql = database();
  if (!sql) {
    const list = await readLocalAppointments();
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  try {
    const rows = await sql<DatabaseAppointment[]>`
      select
        id,
        service,
        appointment_date::text as date,
        appointment_time::text as time,
        name,
        phone,
        email,
        project_details as "projectDetails",
        status,
        created_at::text as "createdAt",
        idempotency_key as "idempotencyKey"
      from appointments
      order by created_at desc
    `;
    return rows.map(toRecord);
  } catch (error) {
    console.error("Failed to query appointments from database", error);
    return [];
  }
}

export async function appointmentStorageHealth() {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("appointments").select("id").limit(1);
    return { ready: !error, storage: "supabase" as const };
  }

  const sql = database();
  if (sql) {
    await sql`select 1`;
    return { ready: true as const, storage: "postgres" as const };
  }

  const fileAllowed =
    env.NODE_ENV !== "production" || env.ALLOW_FILE_APPOINTMENTS;
  return {
    ready: fileAllowed,
    storage: "local-file" as const,
  };
}
