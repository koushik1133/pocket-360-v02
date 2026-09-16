import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import {
  DEFAULT_PACKAGE_TYPE,
  type AppointmentInput,
} from "@/lib/appointment-schema";
import { getSupabaseClient } from "@/lib/supabase";
import { env } from "@/env";

export const appointmentStatuses = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

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

// ─── Postgres (direct connection) ────────────────────────────────────────────

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
const isServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);
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

async function writeLocalAppointments(appointments: AppointmentRecord[]) {
  await mkdir(path.dirname(localPath), { recursive: true });
  const temporaryPath = `${localPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(appointments, null, 2), {
    mode: 0o600,
  });
  await rename(temporaryPath, localPath);
}

function assertLocalAllowed() {
  if (env.NODE_ENV === "production" && !env.ALLOW_FILE_APPOINTMENTS) {
    throw new BookingStorageUnavailableError();
  }
}

async function createLocalAppointment(
  input: AppointmentInput,
): Promise<CreateAppointmentResult> {
  assertLocalAllowed();

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
    await writeLocalAppointments(appointments);

    return { ok: true, record, created: true };
  });
}

async function updateLocalStatus(
  id: string,
  status: AppointmentStatus,
): Promise<AppointmentRecord | null> {
  assertLocalAllowed();
  return withLocalLock(async () => {
    const appointments = await readLocalAppointments();
    const target = appointments.find((appointment) => appointment.id === id);
    if (!target) return null;
    target.status = status;
    await writeLocalAppointments(appointments);
    return target;
  });
}

// ─── Shared row mapping (Supabase + Postgres use the same column names) ──────

type AppointmentRow = {
  id: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  name: string;
  phone: string;
  email: string;
  project_details: string;
  status: AppointmentStatus;
  created_at: string;
  idempotency_key: string;
  // Added in migration 0002 / 002. Nullable in the type so a database that has
  // not run the migration yet still maps cleanly to the defaults.
  package_type?: string | null;
  preferred_time_to_call?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  location_venue?: string | null;
  event_details?: string | null;
};

const rowColumns = `
  id,
  service,
  appointment_date::text as appointment_date,
  appointment_time::text as appointment_time,
  name,
  phone,
  email,
  project_details,
  status,
  created_at::text as created_at,
  idempotency_key,
  package_type,
  preferred_time_to_call,
  country,
  state,
  city,
  location_venue,
  event_details
`;

function fromRow(row: AppointmentRow): AppointmentRecord {
  return {
    id: row.id,
    service: row.service,
    packageType: row.package_type || DEFAULT_PACKAGE_TYPE,
    date: row.appointment_date.slice(0, 10),
    time: row.appointment_time.slice(0, 5),
    name: row.name,
    phone: row.phone,
    email: row.email,
    country: row.country || "United States",
    state: row.state || "",
    city: row.city || "",
    locationVenue: row.location_venue || "",
    preferredTimeToCall: row.preferred_time_to_call || "Anytime",
    eventDetails: row.event_details || row.project_details,
    projectDetails: row.project_details,
    status: row.status,
    createdAt: row.created_at,
    idempotencyKey: row.idempotency_key,
    website: "",
  };
}

function toInsertRow(input: AppointmentInput) {
  return {
    service: input.service,
    appointment_date: input.date,
    appointment_time: input.time,
    name: input.name,
    phone: input.phone,
    email: input.email,
    project_details: input.projectDetails || input.eventDetails,
    status: "pending" as const,
    idempotency_key: input.idempotencyKey,
    package_type: input.packageType,
    preferred_time_to_call: input.preferredTimeToCall,
    country: input.country,
    state: input.state,
    city: input.city,
    location_venue: input.locationVenue,
    event_details: input.eventDetails,
  };
}

// ─── Supabase ────────────────────────────────────────────────────────────────

async function createSupabaseAppointment(
  input: AppointmentInput,
): Promise<CreateAppointmentResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return createLocalAppointment(input);

  try {
    const { data: existing } = await supabase
      .from("appointments")
      .select("*")
      .eq("idempotency_key", input.idempotencyKey)
      .maybeSingle<AppointmentRow>();

    if (existing) {
      return { ok: true, record: fromRow(existing), created: false };
    }

    const { data: conflict } = await supabase
      .from("appointments")
      .select("id")
      .eq("service", input.service)
      .eq("appointment_date", input.date)
      .eq("appointment_time", input.time)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (conflict) return { ok: false, code: "SLOT_TAKEN" };

    const fullRow = toInsertRow(input);
    let { data: inserted, error } = await supabase
      .from("appointments")
      .insert(fullRow)
      .select("*")
      .single<AppointmentRow>();

    // PGRST204 = a column in the payload does not exist. That means migration
    // 002 has not been applied yet. Persist the legacy subset so the booking is
    // never lost, and log loudly so the schema gets updated.
    if (error?.code === "PGRST204") {
      console.warn(
        "[supabase] appointments table is missing the migration 002 columns; folding the extra fields into project_details. Run supabase/migrations/002_appointment_details.sql.",
      );
      // Fold the fields the old schema cannot hold into the notes column so
      // nothing the client typed is lost from the database.
      const extras = [
        `Package: ${fullRow.package_type}`,
        `Call window: ${fullRow.preferred_time_to_call}`,
        `Location: ${
          [fullRow.location_venue, fullRow.city, fullRow.state, fullRow.country]
            .filter(Boolean)
            .join(", ") || "not provided"
        }`,
      ].join("\n");
      const legacyRow = {
        service: fullRow.service,
        appointment_date: fullRow.appointment_date,
        appointment_time: fullRow.appointment_time,
        name: fullRow.name,
        phone: fullRow.phone,
        email: fullRow.email,
        project_details: `${fullRow.project_details}\n\n---\n${extras}`.slice(0, 3000),
        status: fullRow.status,
        idempotency_key: fullRow.idempotency_key,
      };
      ({ data: inserted, error } = await supabase
        .from("appointments")
        .insert(legacyRow)
        .select("*")
        .single<AppointmentRow>());
    }

    if (error || !inserted) {
      console.error("[supabase] createAppointment error:", error);
      return createLocalAppointment(input);
    }

    // Keep the caller's full input in the returned record so emails and the
    // success screen show what the client actually entered.
    const record = { ...fromRow(inserted), ...input, id: inserted.id };
    return { ok: true, record, created: true };
  } catch (err) {
    console.error("[supabase] unexpected exception in createSupabaseAppointment:", err);
    return createLocalAppointment(input);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Priority: Supabase → postgres → local-file
 */
export async function createAppointment(
  input: AppointmentInput,
): Promise<CreateAppointmentResult> {
  if (getSupabaseClient()) return createSupabaseAppointment(input);

  const sql = database();
  if (!sql) return createLocalAppointment(input);

  const row = toInsertRow(input);
  const inserted = await sql<AppointmentRow[]>`
    insert into appointments ${sql(row)}
    on conflict do nothing
    returning ${sql.unsafe(rowColumns)}
  `;

  const createdRow = inserted[0];
  if (createdRow) {
    return { ok: true, record: fromRow(createdRow), created: true };
  }

  const replayed = await sql<AppointmentRow[]>`
    select ${sql.unsafe(rowColumns)}
    from appointments
    where idempotency_key = ${input.idempotencyKey}
    limit 1
  `;

  const replayedRow = replayed[0];
  if (replayedRow) {
    return { ok: true, record: fromRow(replayedRow), created: false };
  }

  return { ok: false, code: "SLOT_TAKEN" };
}

export async function listAppointments(): Promise<AppointmentRecord[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<AppointmentRow[]>();

      if (!error && data) return data.map(fromRow);
      console.error("[supabase] listAppointments error, falling back:", error);
    } catch (err) {
      console.error("[supabase] listAppointments exception, falling back:", err);
    }
  }

  const sql = database();
  if (!sql) {
    const list = await readLocalAppointments();
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  try {
    const rows = await sql<AppointmentRow[]>`
      select ${sql.unsafe(rowColumns)}
      from appointments
      order by created_at desc
    `;
    return rows.map(fromRow);
  } catch (error) {
    console.error("Failed to query appointments from database", error);
    return [];
  }
}

/** Looks up one appointment by id across whichever store is active. */
export async function findAppointment(
  id: string,
): Promise<AppointmentRecord | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .maybeSingle<AppointmentRow>();
    if (error) {
      console.error("[supabase] findAppointment error:", error);
      return null;
    }
    return data ? fromRow(data) : null;
  }

  const sql = database();
  if (!sql) {
    const list = await readLocalAppointments();
    return list.find((appointment) => appointment.id === id) ?? null;
  }

  const rows = await sql<AppointmentRow[]>`
    select ${sql.unsafe(rowColumns)}
    from appointments
    where id = ${id}
    limit 1
  `;
  const row = rows[0];
  return row ? fromRow(row) : null;
}

/** Returns the updated record, or null when no appointment has that id. */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<AppointmentRecord | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .select("*")
      .maybeSingle<AppointmentRow>();
    if (error) {
      console.error("[supabase] updateAppointmentStatus error:", error);
      throw error;
    }
    return data ? fromRow(data) : null;
  }

  const sql = database();
  if (!sql) return updateLocalStatus(id, status);

  const rows = await sql<AppointmentRow[]>`
    update appointments
    set status = ${status}
    where id = ${id}
    returning ${sql.unsafe(rowColumns)}
  `;
  const row = rows[0];
  return row ? fromRow(row) : null;
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
