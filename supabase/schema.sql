-- Pocket Reels 360 - Complete Supabase Database Setup
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)

create table if not exists public.appointments (
  id                      uuid primary key default gen_random_uuid(),
  service                 text not null default 'reel-production',
  package_type            text not null default 'Wedding & Reception Reels',
  appointment_date        date not null,
  appointment_time        time not null default '12:00:00',
  preferred_time_to_call  text not null default 'Morning (9:00 AM – 12:00 PM)',
  name                    text not null,
  phone                   text not null,
  email                   text not null,
  country                 text not null default 'United States',
  state                   text not null default '',
  city                    text not null default '',
  location_venue          text not null default '',
  event_details           text not null default '',
  project_details         text not null default '',
  status                  text not null default 'pending'
                          check (status in ('pending','confirmed','cancelled','completed')),
  idempotency_key         text not null unique,
  created_at              timestamptz not null default now()
);

-- Ensure all columns exist if table was already created
alter table public.appointments
  add column if not exists package_type           text not null default 'Wedding & Reception Reels',
  add column if not exists preferred_time_to_call text not null default 'Morning (9:00 AM – 12:00 PM)',
  add column if not exists country                text not null default 'United States',
  add column if not exists state                  text not null default '',
  add column if not exists city                   text not null default '',
  add column if not exists location_venue         text not null default '',
  add column if not exists event_details          text not null default '';

-- Indexes
create index if not exists appointments_slot_idx
  on public.appointments (service, appointment_date, appointment_time, status);

create unique index if not exists appointments_idempotency_key_idx
  on public.appointments (idempotency_key);

create index if not exists appointments_created_at_idx
  on public.appointments (created_at desc);

-- Row Level Security (RLS)
alter table public.appointments enable row level security;

-- Policies allowing backend operations with anon or service_role key:
drop policy if exists "allow_anon_all" on public.appointments;
drop policy if exists "server full access" on public.appointments;

create policy "allow_anon_all"
  on public.appointments
  for all
  using (true)
  with check (true);
