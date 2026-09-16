import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Global singleton to survive Next.js hot-reloads in dev
const globalForSupabase = globalThis as typeof globalThis & {
  _pocketReelsSupabase?: SupabaseClient;
};

/**
 * Returns a singleton Supabase client using the server-side env vars.
 * Returns `null` when Supabase is not configured (env vars absent),
 * which allows the repository to fall back to the local file store.
 *
 * The service-role key is preferred: it bypasses RLS so the anon key can be
 * fully locked down (see supabase/migrations/002). The anon key remains as a
 * fallback for projects that have not rotated yet.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  globalForSupabase._pocketReelsSupabase ??= createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return globalForSupabase._pocketReelsSupabase;
}
