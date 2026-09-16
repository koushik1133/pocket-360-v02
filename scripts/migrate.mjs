import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.startsWith("postgres")) {
  throw new Error("Set DATABASE_URL to a PostgreSQL connection string.");
}

const migrationsDir = path.join(process.cwd(), "db", "migrations");
const files = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

const sql = postgres(databaseUrl, { max: 1, prepare: false });

try {
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const applied = new Set(
    (await sql`select name from schema_migrations`).map((row) => row.name),
  );

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`Skipping ${file} (already applied)`);
      continue;
    }
    const migration = await readFile(path.join(migrationsDir, file), "utf8");
    await sql.unsafe(migration);
    await sql`insert into schema_migrations (name) values (${file})`;
    console.log(`Applied ${file}`);
  }
} finally {
  await sql.end();
}
