import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.startsWith("postgres")) {
  throw new Error("Set DATABASE_URL to a PostgreSQL connection string.");
}

const migration = await readFile(
  path.join(process.cwd(), "db", "migrations", "0001_appointments.sql"),
  "utf8",
);
const sql = postgres(databaseUrl, { max: 1, prepare: false });

try {
  await sql.unsafe(migration);
  console.log("Applied 0001_appointments.sql");
} finally {
  await sql.end();
}
