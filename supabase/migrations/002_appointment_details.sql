-- Supabase SQL migration 002: persist the full booking record and lock down RLS.
-- Run this in your Supabase project's SQL editor after 001.

alter table public.appointments
  add column if not exists package_type          text not null default 'Wedding & Reception Reels',
  add column if not exists preferred_time_to_call text not null default 'Anytime',
  add column if not exists country               text not null default 'United States',
  add column if not exists state                 text not null default '',
  add column if not exists city                  text not null default '',
  add column if not exists location_venue        text not null default '',
  add column if not exists event_details         text not null default '';

-- Security: the anon key is designed to be public. The original policy granted
-- it full read/write access to every booking (client PII). The server now uses
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS, so anon gets no access at all.
drop policy if exists "server full access" on public.appointments;

-- Keep RLS enabled with no anon/authenticated policies: only the service role
-- (server-side, never shipped to browsers) can read or write appointments.
alter table public.appointments enable row level security;
