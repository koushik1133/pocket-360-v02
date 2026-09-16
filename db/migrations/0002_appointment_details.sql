-- Persist every field the booking wizard collects. Before this migration the
-- package, call window, location, and event details were silently dropped when
-- a database (Supabase or direct Postgres) was configured.
begin;

alter table appointments
  add column if not exists package_type text not null default 'Wedding & Reception Reels',
  add column if not exists preferred_time_to_call text not null default 'Anytime',
  add column if not exists country text not null default 'United States',
  add column if not exists state text not null default '',
  add column if not exists city text not null default '',
  add column if not exists location_venue text not null default '',
  add column if not exists event_details text not null default '';

-- The wizard allows 3,000 characters; the original constraint capped at 2,000.
alter table appointments drop constraint if exists appointments_project_details_check;
alter table appointments
  add constraint appointments_project_details_check
  check (char_length(project_details) <= 3000);

alter table appointments
  add constraint appointments_event_details_check
  check (char_length(event_details) <= 3000);

commit;
