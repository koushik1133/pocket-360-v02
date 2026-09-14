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

1. Create a PostgreSQL database and set `DATABASE_URL`.
2. Apply the checked-in schema:

   ```bash
   npm run db:migrate
   ```

3. Create a Resend account and set:
   - `RESEND_API_KEY`
   - `APPOINTMENT_FROM_EMAIL` (a verified sender)
   - `APPOINTMENT_NOTIFY_EMAIL` (the business inbox)
4. Add only verified public contact details:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` in international digits
   - `NEXT_PUBLIC_CONTACT_EMAIL`
   - `NEXT_PUBLIC_CONTACT_PHONE`
5. Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin.
6. Keep `ALLOW_FILE_APPOINTMENTS=false` in production.

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
