begin;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type appointment_status as enum (
      'pending',
      'confirmed',
      'cancelled',
      'completed'
    );
  end if;
end
$$;

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  service text not null check (service in ('reel-production')),
  appointment_date date not null,
  appointment_time time not null,
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) between 7 and 24),
  email text not null check (char_length(email) <= 254),
  project_details text not null default '' check (char_length(project_details) <= 2000),
  status appointment_status not null default 'pending',
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists appointments_idempotency_key
  on appointments (idempotency_key);

create unique index if not exists appointments_active_slot_key
  on appointments (service, appointment_date, appointment_time)
  where status in ('pending', 'confirmed');

create index if not exists appointments_date_status_idx
  on appointments (appointment_date, status);

create index if not exists appointments_created_at_idx
  on appointments (created_at desc);

commit;
