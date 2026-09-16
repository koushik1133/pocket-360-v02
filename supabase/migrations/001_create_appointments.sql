-- Supabase SQL migration: create appointments table
-- Run this in your Supabase project's SQL editor:
-- https://gdeavawllxtdzgllryxf.supabase.co

create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  service          text not null,
  appointment_date date not null,
  appointment_time time not null,
  name             text not null,
  phone            text not null,
  email            text not null,
  project_details  text not null default '',
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','cancelled','completed')),
  idempotency_key  text not null unique,
  created_at       timestamptz not null default now()
);

-- Index for slot-conflict queries
create index if not exists appointments_slot_idx
  on public.appointments (service, appointment_date, appointment_time, status);

-- Index for idempotency lookups
create unique index if not exists appointments_idempotency_key_idx
  on public.appointments (idempotency_key);

-- Row-Level Security: allow server-side anon key full access
alter table public.appointments enable row level security;

-- Policy: allow all operations via the anon/service role
-- (Supabase anon key is used server-side only, never exposed to browsers)
create policy "server full access"
  on public.appointments
  as permissive
  for all
  to anon
  using (true)
  with check (true);
