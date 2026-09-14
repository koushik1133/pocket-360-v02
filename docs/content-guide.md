# Content guide

## Before publishing a change

Verify every business fact against the public Pocket Reels 360 Instagram
profile or information supplied directly by the owner. Avoid adding prices,
opening hours, testimonials, client relationships, awards, metrics, contact
details, or locations without a source.

## Brand information

Edit `brand` in `src/content/site.ts`. Keep the source wording aligned with the
public profile:

- reel-maker crew
- shoots on iPhone
- shoots, edits, and delivers
- Dallas, NYC, Chicago, and Charlotte

## Portfolio and reels

1. Add the approved image or video poster to `public/media`.
2. Add one `workItems` entry in `src/content/site.ts`.
3. Link to the original Instagram post or reel.
4. Write literal alt text describing the visible frame.
5. Use a category already supported by multiple real posts, or add a category
   only when the feed clearly supports it.

The site intentionally links to Instagram for playback instead of downloading
or fabricating reel video files.

## Contact and WhatsApp

Configure verified details with environment variables rather than hardcoding
them:

- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_CONTACT_PHONE`

The website hides unavailable contact methods. This prevents a temporary or
invented number from reaching production.

## Appointment email

Configure the verified sender and business inbox through:

- `RESEND_API_KEY`
- `APPOINTMENT_FROM_EMAIL`
- `APPOINTMENT_NOTIFY_EMAIL`
- `APPOINTMENT_FROM_NAME`

Run the complete browser test after content, booking, or contact changes.
