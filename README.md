# CryptoBot Europe SEO Affiliate Site (Next.js)

## Quick architecture
- **Framework:** Next.js App Router + TypeScript + Tailwind
- **Purpose:** SEO-first affiliate content hub for Europe
- **Core monetization route:** internal redirects `/go/[slug]`

## Where affiliate links are stored
Edit: `data/affiliate-links.ts`

Each link is centrally managed with fields like:
- `slug`
- `partnerName`
- `destinationUrl`
- `active`
- `category`
- `notes`

This lets you update destination URLs safely without changing all content pages.

## How `/go/[slug]` works
File: `app/go/[slug]/route.ts`

Flow:
1. Resolve slug from central registry.
2. Log click event (source page, referrer, user-agent, utm params, country, anonymized IP hash).
3. Redirect with **302** to final destination URL.

Click logs are appended to: `data/click-events.ndjson` via `lib/tracking.ts`.

## How to add new SEO pages
1. Add a new entry to `data/seo-pages.ts`.
2. It will auto-render at `/<slug>` via `app/[slug]/page.tsx`.
3. Include:
   - title/description
   - sections
   - pros/cons
   - faq
   - related links
   - `ctaSlug`

## How to add new country pages
In `data/seo-pages.ts`, add page object with:
- `type: 'country'`
- desired country slug (e.g. `cryptobot-in-netherlands`)
- localized intro + FAQs + related pages

The route and sitemap entries are generated automatically.

## How to change destination referral links safely
1. Open `data/affiliate-links.ts`.
2. Find existing `slug` (e.g. `cryptobot`, `cryptobot-p2p`).
3. Replace only `destinationUrl`.
4. Keep slug stable so all existing page CTAs keep working.

## Notes
- Keep content informational-first for long-term SEO quality.
- Keep affiliate disclosure visible and honest.
