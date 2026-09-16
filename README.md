# Pocket Reels 360

A production-ready editorial portfolio and appointment website for
[@pocketreels360](https://www.instagram.com/pocketreels360/).

The public profile was treated as the source of truth. The website uses the
profile's published positioning—an iPhone reel-maker crew that shoots, edits,
and delivers—and its listed locations: Dallas, NYC, Chicago, and Charlotte.
Public phone, WhatsApp, and email details were not visible, so those controls
remain hidden until real values are configured.

## Stack

- Next.js App Router, React, and TypeScript in strict mode
- PostgreSQL through `postgres.js`
- Resend-compatible email delivery through its production HTTP API
- Zod validation on the server
- Vitest unit tests and Playwright browser tests
- Tailwind CSS v4 build pipeline with a custom editorial CSS design system

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. In development only, appointments fall back to
`data/appointments.json`; that file is ignored by Git.

## Production setup

1. Pick one appointment store:
   - **Supabase (recommended on Vercel):** set `NEXT_PUBLIC_SUPABASE_URL` and
     `SUPABASE_SERVICE_ROLE_KEY`, then run every file in `supabase/migrations`
     in order from the Supabase SQL editor. Migration `002` adds the columns
     for package, call window, location, and event details, and removes the
     public `anon` policy so the anon key can no longer read client data.
   - **Direct PostgreSQL:** set `DATABASE_URL` and apply the checked-in schema:

     ```bash
     npm run db:migrate
     ```

     The script tracks applied files in `schema_migrations`, so it is safe to
     re-run after pulling new migrations.

2. Until a database is connected, bookings fall back to a JSON file. On Vercel
   that file lives in `/tmp` and is wiped between deployments, so set
   `ALLOW_FILE_APPOINTMENTS=false` once the database is live.
3. Choose an email transport. Clients get an automatic confirmation when they
   book, and the crew sends approval or decline emails from `/admin`.
   - **Gmail (recommended, sends from your own address):** turn on 2-Step
     Verification, create an App Password at
     https://myaccount.google.com/apppasswords, then set `GMAIL_USER` and
     `GMAIL_APP_PASSWORD`. Replies land in that inbox.
   - **Resend:** set `RESEND_API_KEY` and `APPOINTMENT_FROM_EMAIL` on a domain
     you have verified in Resend. The sandbox sender `onboarding@resend.dev`
     can only deliver to the Resend account owner, so clients receive nothing
     until a domain is verified.
   - Set `APPOINTMENT_NOTIFY_EMAIL` to the crew inbox for new-booking alerts
     (defaults to `GMAIL_USER` when Gmail is used).
4. Add only verified public contact details:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` in international digits
   - `NEXT_PUBLIC_CONTACT_EMAIL`
   - `NEXT_PUBLIC_CONTACT_PHONE`
5. Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin.
6. Set `ADMIN_PASSWORD` to a PIN of your own. The `/admin` portal lists every
   enquiry, offers **Approve** and **Deny** buttons that open a pre-drafted,
   editable email (deny comes with reason presets such as no crew coverage or
   date unavailable), sends it to the client, records the status, and exports
   a CSV. Its **System** panel shows exactly which database, email transport,
   and assistant the running deployment has picked up.
7. Optional AI assistant: set `GROQ_API_KEY`. Without it the widget still
   answers from the built-in knowledge base.

### Vercel checklist

Open the project → Settings → Environment Variables, remove every stale key,
and add these for **Production** (and Preview if you use it), then redeploy:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain` |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | from the same page (service_role, secret) |
| `ALLOW_FILE_APPOINTMENTS` | `false` |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | your Gmail + App Password |
| `APPOINTMENT_NOTIFY_EMAIL` | crew inbox |
| `ADMIN_PASSWORD` | your PIN |
| `GROQ_API_KEY` | optional |

After the deploy, `GET /api/health` must report `"storage":"supabase"` and
`"email":"gmail"` (or `"resend"`). `local-file` means the Supabase variables
were not picked up.

Email status is reported honestly. If provider configuration is absent or a
send fails, the appointment can still be saved, but the interface says that a
confirmation email was not sent.

## Content updates

Brand, locations, services, portfolio items, captions, and Instagram URLs live
in `src/content/site.ts`. Media lives in `public/media`. See
`docs/content-guide.md` before changing claims or adding work.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm audit --audit-level=high
```

The browser suite covers portfolio filtering and lightbox behavior, complete
booking, server validation, duplicate-slot prevention, WCAG 2 AA serious
violations, and overflow at 320, 375, 390, 768, 1024, and 1440 pixels.

## Docker

```bash
docker build -t pocket-reels-360 .
docker run --rm -p 3000:3000 --env-file .env pocket-reels-360
```

The image runs Next.js standalone output as a non-root user and checks
`/api/health`.
