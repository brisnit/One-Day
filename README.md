# One Day Offering

A clean, inspiring giving calculator. Donors enter how they're paid; the app computes what *one working day* of their income is worth — their One Day Offering.

> **One day can change someone's forever.**

Built as a polished front-end prototype with Next.js 14 (App Router), TypeScript, and Tailwind CSS. Branding follows the Convoy of Hope brand guidelines (light surface, amber accent, navy ink, Roboto Bold + Inter).

---

## Running locally

```bash
# 1. Install deps
npm install

# 2. Start the dev server
npm run dev

# 3. Open in your browser
open http://localhost:3000
```

You'll need Node 18.18+ (Node 20 recommended). No env vars required — there's no backend.

### Production build (optional)

```bash
npm run build
npm run start
```

---

## What's inside

### Routes

| Route | Purpose |
|---|---|
| `/` | Public homepage |
| `/how-it-works` | Explainer page |
| `/for-organizations` | Pitch for campaign leaders |
| `/start` | 4-step org setup wizard (logo, accent, vision, Kingdom Impact Mode) |
| `/dashboard` | List of saved campaigns |
| `/dashboard/[slug]` | Single campaign dashboard with copyable link + QR code |
| `/c/[slug]` | Branded donor landing page |
| `/c/[slug]/calculate` | Calculator (6 income types, schedules, day-off exclusion) |
| `/c/[slug]/results` | Big result card + impact grid + giving CTA |
| `/c/[slug]/family` | Household / multi-income calculator |
| `/c/[slug]/share` | Downloadable share card (PNG) with embedded QR |
| `/settings` | Local-data management + brand defaults |

Try the included sample campaign at **`/c/convoy-of-hope`**.

### Calculator logic

All math lives in `lib/calculator.ts`. The core formula:

```
One Day Offering = Annual Income ÷ Estimated Workdays
```

Supports six income types (annual, monthly, biweekly, weekly, hourly, household) and four schedules (4/5/6 days/week, or custom). When *Exclude days off* is on, vacation/sick/holidays/personal days are subtracted from the base.

### Storage

Campaigns created in the setup wizard are persisted to the browser's `localStorage` under `odo.campaigns.v1`. Two demo campaigns ship pre-loaded. There is **no backend**.

### Payments

Intentionally not wired up. The "Give My One Day Offering" button links to whatever URL the org pasted into setup.

---

## Vercel KV (production persistence)

Campaigns are stored server-side in Vercel KV (managed Redis) so they're shared across browsers and devices — a donor scanning a QR on their phone will find the campaign even though it was created on someone's laptop.

**One-time setup on Vercel:**
1. Go to your project on vercel.com → **Storage** tab
2. Click **Create Database** → **KV** (Vercel KV / Upstash Redis)
3. Pick a region close to your users, click **Create**
4. On the next screen click **Connect Project** and select this project
5. Vercel auto-injects four env vars (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) into the project — no manual config needed
6. Redeploy (it'll happen automatically on the next push)

**Local dev:** the app falls back to `localStorage` if the `KV_*` env vars are missing, so you don't need KV to run `npm run dev`. To use the production KV from local dev, run `npx vercel env pull .env.local` after the `vercel` CLI is connected to your project.

**Data shape in KV:**
- `campaign:<slug>` → serialized campaign JSON
- `campaigns:index` → Redis SET of all created slugs (used by the dashboard list)

The two seeded demo campaigns (`/c/convoy-of-hope`, `/c/hope-city-church`) are hard-coded in `lib/mockData.ts` and always available — no KV write needed for those.

---

## File layout

```
app/                  # Next.js App Router pages
  c/[slug]/           # Donor flow (landing → calculate → results → share/family)
  dashboard/[slug]/   # Org dashboard for a single campaign
  start/              # Org setup wizard
  settings/           # Local data + brand defaults
components/           # Reusable UI: Logo, Field, ShareCard, ImpactGrid, QRBlock, …
lib/
  calculator.ts       # Pure calculation + validation logic
  storage.ts          # KV-first storage layer with localStorage fallback
  mockData.ts         # Demo campaigns + impact categories
  types.ts            # Shared TS types
  format.ts           # Currency + slug helpers
public/logo.png       # One Day Calculator logo
tailwind.config.ts    # Brand palette + type scale
```

---

## Brand notes

Pulled from `brand assets/Brand Guidelines.png`:

- **Surface:** `#F6F8FC` (Soft Cloud)
- **Ink:** `#111B27` (Deep navy)
- **Primary CTA:** `#FBBF24` (Soft Amber) — used for the One Day number and main buttons
- **Display:** Roboto Bold · **Body:** Inter
- Logo is centered everywhere donors land, per direction

---

## Known prototype limits

- No auth — `/dashboard` shows whatever campaigns exist in *your* browser's localStorage.
- Share-card PNG download uses `html-to-image`; on Safari, fonts in the rendered PNG can occasionally fall back. Take a screenshot if the download looks off.
- No real payments. The giving CTA opens the org's pasted URL.
- QR codes encode the campaign URL on whatever `window.location.origin` is — they'll point at `localhost:3000` until deployed.
