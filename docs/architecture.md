# Architecture

## Product

Pocket Reels 360 is a public portfolio and appointment site for a reel-maker
crew. Visitors can discover the crew, view actual Instagram work, open a
keyboard-accessible portfolio lightbox, follow original reels, and submit an
appointment request.

## Source of truth

- Public brand and service facts: Pocket Reels 360 Instagram profile
- Marketing content model: `src/content/site.ts`
- Portfolio media: `public/media`
- Appointment records: PostgreSQL in production
- Email delivery: Resend HTTP API configured through server-only environment
  variables

No public phone, WhatsApp, email, street address, pricing, reviews, client
claims, awards, or opening hours were visible during research. The site does
not publish those values unless an owner supplies them through configuration.

## Entity

`appointments`

- `id`
- `service`
- `appointment_date`
- `appointment_time`
- `name`
- `phone`
- `email`
- `project_details`
- `package_type`
- `preferred_time_to_call`
- `country`, `state`, `city`, `location_venue`
- `event_details`
- `status`: pending, confirmed, cancelled, completed
- `idempotency_key`
- `created_at`
- `updated_at`

Storage priority is Supabase, then direct PostgreSQL, then the local JSON
file. All three share one row mapping in `src/server/appointments/repository.ts`.

The partial unique index on service, date, and time prevents duplicate pending
or confirmed requests. The idempotency key makes a network retry safe.

## Trust boundaries

The browser is untrusted. `POST /api/appointments` validates every field with
Zod, enforces same-origin requests, rejects oversized bodies, applies a rate
limit, checks a honeypot, and writes through the appointment repository.
Provider and database secrets are never exposed through `NEXT_PUBLIC_*`.

## Routes

- `/` — static editorial portfolio
- `/book` — static shell with the client-side six-step booking flow
- `/privacy` and `/terms` — public policy pages
- `/api/appointments` — dynamic Node.js appointment mutation
- `/api/admin/appointments` — PIN-protected list, CSV export, status update
  (`PATCH`), session cookie login (`POST`) and logout (`DELETE`)
- `/api/assistant` — Groq-first, Anthropic-fallback concierge chat
- `/api/health` — dynamic storage readiness check
- `/admin` — crew bookings portal, rendered without the marketing chrome
- `/robots.txt`, `/sitemap.xml`, `/opengraph-image` — generated SEO assets

## Appointment flow

1. Select the verified service: reel production
2. Choose a preferred date
3. Choose a preferred local time
4. Enter name, phone, and email
5. Add optional project details
6. Review and confirm
7. Persist the pending request
8. Send customer and business notification emails when configured
9. Display an honest success state with reference and calendar export

Preferred times are not presented as published availability. Copy throughout
the flow states that the crew will confirm.

## Content management path

The current content adapter is a typed local module. Its `brand`,
`reelProcess`, `workItems`, `highlights`, and `primaryService` exports are the
seams for a future Supabase or headless CMS adapter. Components consume those
typed values rather than embedding portfolio records.
