# Bloom · Rendez-vous

**Brand**: Bloom (one word, the name people say)
**Domain**: bloomrdv.com
**Tagline**: Booking, beautifully · Where bookings bloom into experiences
**Positioning**: The premium, magical alternative to Calendly/Acuity for stylists, therapists, and creative service providers.

The git repo is still named `Scheduler` for historical reasons — that's fine, we're not renaming it. All user-facing strings, metadata, OG tags, manifest, emails, etc. should say "Bloom" — never "Scheduler" except in this internal note.

Booking/scheduling SaaS for hair stylists, beauty pros, and therapists. Providers set up services, availability, and branding, then share a public booking link where clients pick a service, choose a time, pay via Stripe, and get confirmed.

## Naming convention (post-rebrand 2026-04-10)

- Brand name: **Bloom** (when said aloud or written in marketing)
- Full name: **Bloom · Rendez-vous** (formal/legal)
- URL: **bloomrdv.com** (and `bloomrdv.com/[slug]` for booking pages)
- Code repo: `Scheduler` (internal only, do not rename)
- Database table: `providers` (do not rename)
- Existing template named "Bloom" (the warm/feminine one): kept as internal ID `"bloom"` for data compatibility, but **display name changed to "Rose"** so users don't confuse it with the brand.

## Tech Stack

- **Framework**: Next.js 16+ (App Router, Server Components, Server Actions)
- **Database + Auth**: Supabase (PostgreSQL, RLS, Auth, Edge Functions)
- **Styling**: Tailwind CSS v4 + shadcn/ui (base-ui, NOT radix — no `asChild` prop)
- **Payments**: Stripe Connect (destination charges model)
- **SMS/WhatsApp**: Twilio (Phase 3)
- **Email**: Resend + React Email
- **Calendar Sync**: googleapis, Microsoft Graph, tsdav (CalDAV) — Phase 4
- **Validation**: Zod
- **Forms**: React Hook Form
- **Dates**: date-fns + date-fns-tz
- **Deploy**: Vercel (hobby tier — no cron jobs)

## Project Structure

```
src/
  app/
    (auth)/          # login, signup, callback, onboarding
    (dashboard)/     # provider dashboard (authenticated, sidebar layout)
    book/[slug]/     # public booking page (themed per-business via template system)
    api/             # route handlers (availability, bookings, stripe)
  components/
    ui/              # shadcn/ui (DO NOT edit manually — use `npx shadcn add`)
    booking/         # themed booking components (template-wrapper, themed-card, etc.)
    dashboard/       # sidebar, stats, lists
    settings/        # template picker
  lib/
    supabase/        # client.ts (browser), server.ts (SSR), admin.ts (service role)
    templates/       # template system (definitions, fonts, context)
    calendar/        # google.ts, microsoft.ts, caldav.ts, sync.ts (Phase 4)
    availability.ts  # core slot calculation engine
    stripe.ts        # lazy-initialized Stripe client (getStripe())
    resend.ts        # email sending
  types/
    database.ts      # Supabase types (must include Relationships: [] on every table)
supabase/
  migrations/        # numbered SQL files
  functions/         # edge functions
```

## Template/Vibe System

6 templates that completely transform the booking page appearance:

| Template | Vibe | Fonts |
|----------|------|-------|
| **Aura** | Ethereal, calm | Cormorant Garamond + Inter |
| **Bloom** | Warm, feminine | Playfair Display + DM Sans |
| **Edge** | Bold, dark | Space Grotesk + JetBrains Mono |
| **Luxe** | Minimal, premium | Bodoni Moda + Outfit |
| **Pop** | Colorful, energetic | Fredoka + Nunito |
| **Studio** | Clean, professional | Plus Jakarta Sans |

### How it works
- **Definitions**: `src/lib/templates/index.ts` — TEMPLATES record with cssVars, classes, animations, decorations per template
- **Fonts**: `src/lib/templates/fonts.ts` — 11 Google Fonts pre-instantiated, `getTemplateFonts()` helper
- **Context**: `src/lib/templates/context.ts` — `TemplateProvider` + `useTemplate()` hook
- **Animations**: `src/app/template-animations.css` — CSS @keyframes + @utility per template
- **Injection**: `src/app/book/[slug]/layout.tsx` fetches provider → reads `branding.template` → injects CSS vars on wrapper div
- **Themed components**: `ThemedCard`, `ThemedButton`, `ThemedTimeSlot` use `useTemplate()` to apply template-specific classes
- **Decorations**: `src/components/booking/decorations.tsx` — floating orbs (Aura), grid (Edge), confetti (Pop), shimmer (Bloom)
- **Default**: Providers without a template default to "studio"

### Adding a new template
1. Add to `TemplateId` union type and `TEMPLATE_IDS` array in `src/lib/templates/index.ts`
2. Define the full `TemplateDefinition` object (cssVars, classes, animations, decorations)
3. Add fonts in `src/lib/templates/fonts.ts`
4. Add animations in `src/app/template-animations.css`
5. Add decorations in `src/components/booking/decorations.tsx` if needed

## Key Patterns

- **shadcn/ui v4 uses base-ui, NOT radix.** Buttons do NOT support `asChild`. For link-buttons use `buttonVariants()` on an `<a>` or `<Link>` element.
- **Supabase types**: Every table in `database.ts` MUST have `Relationships: []` or the Supabase client resolves Insert/Update types to `never`.
- **Stripe**: Use `getStripe()` (lazy init) instead of a top-level `new Stripe()` to avoid build errors when env vars aren't set.
- **Dynamic rendering**: Auth and dashboard layouts use `export const dynamic = "force-dynamic"`.
- **Sidebar navigation**: Uses plain `<a>` tags (not Next.js `<Link>`) to avoid client-side hydration failures.
- **Template CSS vars**: Applied via inline `style` on booking page wrapper div. Overrides shadcn's CSS variables automatically.
- **Edge template dark mode**: Uses CSS variable scoping on the wrapper div, NOT the `.dark` class.
- **No hardcoded colors in booking pages**: Use semantic tokens (`text-foreground`, `bg-card`, etc.) so templates work.

## 🛡️ Operating Guardrails (the rules of engagement)

**Read these before adding any new feature.** The full version lives in `~/.claude/plans/velvety-jingling-yeti.md` under "Operating Guardrails."

### North star metric
**Active providers** = providers logged in 3+ times in last 7 days AND have at least 1 service. Every feature decision gets weighed against: *"Will this move the north star?"* If the answer isn't yes, ask why you're building it.

### Definition of shippable
A task is **not done** until: build passes, deploy is green, manually clicked through on the deployed site (not just localhost), tested on real mobile (after PWA task), no console errors, empty/loading/error states all work, and Allie has personally used it once.

### "Won't do" list (until at least Phase 5)
Saying no protects the plan. Refuse to build any of these mid-session — add to a "v2 ideas" file and move on:
- Time tracking, inventory, invoicing beyond Stripe, custom domains, our own video player, our own rich text editor, real-time collab on the page builder, mobile app (PWA covers this), webhook system, public API, Zapier, white-labeling.

### Phase done = real-world success criteria
Each phase has a concrete user-validation criterion in the plan file. Examples:
- **Phase 1 done**: Allie's hairstylist personally completes a booking end-to-end on her phone, gets the email, cancels successfully, customizes her page in <5 minutes without help.
- **Phase 2 done**: Calendar is the page she opens 3+ times per week. SMS reminder fires for a real upcoming appointment.

### Tester smoke test script
Send Allie's hairstylist + therapist a 20-step script as soon as Phase 1 Tasks 3-5 ship. Don't wait until all of Phase 1 is done. Get feedback in batches. Full script in plan file §6.

### Risk register
8 risks tracked with mitigations in the plan file §5. Highest watch items: testers ghosting, mobile UX surprises, calendar over-budget, email spam folder.

### Pricing hypothesis (strawman locked 2026-04-10, live on landing page)

Five tiers, no Enterprise card (a "Need 16+ staff? Talk to us" link covers it):

| Plan | Price | Includes |
|---|---|---|
| **Free** | $0 forever | 1 service, **unlimited bookings**, all 6 templates, page builder + customize, email confirmations, "Powered by Bloom" footer |
| **Starter** | $19 / mo | Unlimited services, no footer, custom branding, all wow effects, all 8 widgets |
| **Pro** ⭐ | $39 / mo | + SMS reminders, smart re-booking nudges, intake forms, **client memory + color formulas**, photos attached to bookings, sell digital products |
| **Salon** | $79 / mo | + 2-5 staff members, per-staff schedules, team booking, "Meet the team" widget, shared calendar |
| **Studio** | $149 / mo | + 6-15 staff, custom domain, white label (no Bloom branding), priority support, advanced analytics |

**Key principle**: Free is gated by **scope** (1 service, footer), NOT by booking count. Throttling on bookings punishes the providers we most want as long-term customers (the ones who are growing). The upgrade triggers are real product moments — "I want a second service," "I want SMS reminders," "I want to see last visit's color formula" — not arbitrary count ceilings.

**14-day free trial on all paid plans, no credit card required.**

### Annual credit packs (Phase 5+ idea, save for later)

Some providers are seasonal — wedding photographers, event planners, holiday-season businesses. They have 3 busy months and 9 dead months and would resent paying $19-39/mo year-round.

For them, ship a **prepaid credit pack** alongside the monthly tiers:
- **Solo Annual**: $99/year for 100 bookings, use anytime over 12 months
- **Solo Plus**: $199/year for 250 bookings

Cleaner UX (one purchase, no metered billing, no booking counters mid-month), better unit economics (cash collected upfront), and serves a real underserved segment without cannibalizing the monthly subscriptions.

**Don't build this in v1.** Wait until data shows real users churning between months of heavy use and months of nothing — then ship as a third option in the pricing grid.

### Weekly tester cadence
Friday Loom + 3 specific questions + take notes in `tester-feedback.md` + thank-yous every 2-3 weeks. Engaged testers stay engaged.

---

## Client Accounts Architecture (locked 2026-04-11)

Bloom has two audiences: providers (who run the business) and clients (who book appointments). The marketing landing at `bloomrdv.com` is for **providers**. Clients discover Bloom through a specific provider's booking page like `bloomrdv.com/petal-polish` shared on Instagram, a business card, or an appointment reminder email. Clients never visit the marketing landing in a healthy flow.

### Scope decision: Global accounts, positioned as per-provider in v1

- **Data model is global**: one `clients` row per unique email across all of Bloom
- **Marketing in v1 is per-provider**: the login modal is themed to match the active provider, and clients don't think of themselves as "Bloom users," they think of themselves as "Anna's clients"
- Enables future network effects (cross-provider search, Shop-style marketplace in Phase 6) without a painful migration
- Matches how Fresha, Booksy, Vagaro, Mindbody all handle this

### Auth mechanism: Magic links only

- `supabase.auth.signInWithOtp({ email })` — no passwords, ever
- Clients book a haircut 4×/year. They will not remember a password. Forcing one is the #1 conversion killer.
- Passkey (WebAuthn) upgrade is a v2 option but not shipped in v1

### Booking flow: Guest checkout stays, accounts are optional

- A first-time booking never forces signup (Amazon-style guest checkout)
- Before the final "Book" button, a small checkbox: "☐ Save my details for faster checkout next time"
- If checked, server creates the `clients` row and sends a magic link alongside the confirmation email
- Unchecked, nothing changes — the booking still works

### Provider-side identity management (Phase 3)

Because one human can book twice with different emails ("Alejandra" with `aleja@gmail.com`, then "Allie" with `allie@pm.me`), the stylist needs a way to unify them in her client list without merging the auth identities.

Solution: **two-layer identity model**.

- `clients` table — auth-side identity, one row per unique email, owned by Supabase Auth
- `provider_clients` table — provider-side view, one row per (provider × human). Each has a `primary_display_name`, `primary_notes`, `merged_from uuid[]`, photos, color formulas, etc.
- `provider_client_emails` table — the aliases (one provider_client can have many emails)
- `bookings` has BOTH `client_id` (auth-side) AND `provider_client_id` (stylist-side)

When a stylist merges two `provider_clients`:
- She picks one as primary, the other gets marked as merged (soft-deleted)
- All bookings that pointed to the secondary re-point to the primary
- Notes are concatenated with `--- Merged from [other name] on [date] ---`
- Aliases list grows
- The two `clients.id` (auth-side) stay separate — Alejandra can never see Allie's bookings via her own login

This is safe, undoable within a grace period, and matches how Salesforce, HubSpot, and Zoho handle contact merges.

**Merge is Phase 3**, not v1. Trying to cram it into v1 bloats scope.

### v1 must-haves (the first client accounts shipment, ~9.5 hours)

1. **Migration**: `clients` table (id, email, name, phone, created_at, last_seen_at, email_preferences), RLS policies
2. **Bookings extension**: add `client_id uuid references clients(id)` (nullable, legacy guest bookings keep null)
3. **Magic link auth**: `signInWithOtp` wired up via Supabase Auth with a themed login modal on the provider's booking page
4. **`/auth/callback`**: extended to handle client logins (currently only handles providers)
5. **Checkout checkbox**: "Save my details for faster checkout next time" on `/book/[slug]/[serviceId]`
6. **Auto-fill**: on the booking form, if the client is logged in, pre-fill name/email/phone
7. **`/account` page**: unbranded (Bloom marketing aesthetic), shows "My bookings" across all providers this client has booked with
8. **`/account/bookings/[id]`**: single booking detail with add-to-calendar, rebook, and cancel actions
9. **Magic link email template**: Bloom-branded, sent via Resend

### v1 explicitly NOT shipping

- Passkey support (v2)
- Cross-provider search / marketplace (Phase 6)
- Color formula sharing with clients (Phase 3)
- Loyalty dashboards (Phase 4)
- Payment method saved in account (Phase 3)
- Marketing email preferences UI (unsubscribe link only in v1)
- Backfill: linking past guest bookings to a newly-created account (nice-to-have — add if time)

### Routes

| Route | Purpose | Auth |
|---|---|---|
| `/book/[slug]` | Provider's booking landing (existing) | Public |
| `/book/[slug]/[serviceId]` | Booking form (existing) | Public with optional client session |
| `/auth/callback` | Magic link target (existing, extend) | — |
| `/account` | Global "my bookings" for clients | Client only |
| `/account/bookings/[id]` | Single booking detail | Client (own bookings only) |

### Marketing landing

- Marketing landing at `bloomrdv.com` stays provider-focused
- A small footer line directs confused clients: "Are you a client? Visit your provider's page directly — usually shared on their Instagram, business card, or appointment reminder."

### Phase 6+: Shop

Much later, when there are enough providers on Bloom, the `/account` page grows into a client-side marketplace — "discover service providers near you," ratings, categories, favorites. Like Shopify's Shop app for booking services. **Not on any short-term roadmap** — mentioned here only so architecture decisions don't foreclose it.

---

## Tester Findings 2026-04-12 (Allie's first full walkthrough)

After shipping trust layer + data export + themed availability calendar + booking polish, Allie tested the product end-to-end and surfaced a concrete list of gaps. Some are fast fixes, some are real features, some are "queue it for later."

### Fast fixes (shipped 2026-04-12)

All four shipped in one session and are live on main.

**1. Date override as a range** ✅ (commit `fc97ad5`)
`/availability` override form now accepts a start + end date, defaults end to same day for single-day use, guards against backwards ranges and year-plus ranges, and expands the range into one row per day in `availability_overrides` so each day stays independently editable.

**2. Slot increments + per-service buffer time** ✅ (commit `f92eb1e`, migration `00005_service_buffers.sql`)
The hardcoded `SLOT_INTERVAL = 15` is gone. Three real dials:
- Settings → **Booking Defaults** card: slot interval pill picker (15 / 30 / 60) + provider-wide buffer before/after inputs. Stored in `providers.branding.default_slot_minutes`, `default_buffer_before_minutes`, `default_buffer_after_minutes`.
- Services form → **"Using default / Using override"** toggle that reveals per-service `buffer_before_minutes` / `buffer_after_minutes` inputs. NULL = inherit provider default; any number (including 0) is a hard override.
- Availability algorithm pads every existing booking by ITS OWN service's buffers (fetched via a `servicesById` lookup), and new candidate slots must have `newBuffers.before` prep time and `newBuffers.after` cleanup time inside the same free window. `getAvailabilityCounts` does the same math so the month-view capacity colors stay honest.

**3. Data export: CSV prominence swap** ✅ (commit `490188e`)
New `type=all-csv` export returns a single spreadsheet-ready CSV with four sections (Bookings / Clients / Services / Payments) separated by `# SECTION` banners. Settings card reworked: CSV "Everything" is the hero button, per-table CSVs are secondary, JSON is demoted to a small "Developer option" link.

**4. JSON import** ✅ (commit `490188e`)
New POST `/api/import` accepts a multipart `bloom-export-*.json` upload, validates it's a Bloom export (`export_metadata` key + zod schema per row), and imports **services only**. Malformed rows skip with a count rather than aborting. 5 MB cap. Bookings/clients/payments import deferred because the original `service_id` won't match the newly-created rows — that's its own future task.

### Still queued for later sessions

**5. Google Places API auto-fill for business info (own session)**
Stylists are lazy about typing their business name, address, phone, website. Let them paste a Google Maps link or search by business name, and auto-fill everything. Requires Google Cloud billing setup (free within the $200/mo credit for our scale, ~11k lookups), API key rotation, and proper UX design (autocomplete vs paste URL vs search modal). Not a 5-minute task — deserves its own session with focused design thinking.

**Alternative lazy-onboarding paths** (lower friction for us, worth brainstorming alongside):
- Paste Instagram handle → pre-fill bio + hero image from IG Basic Display API (free)
- Paste existing Calendly / Acuity / Vagaro URL → parse the page

**6. Template Personality Pass (own session or two)**
The gap between the gorgeous marketing landing and the booking templates is real. P2.5 closed the fast 80%. The Template Personality Pass is the remaining 20% + the per-template signature wow moments. Scope:

**Typography micro-adjustments** (tiny code, huge visual impact):
- Letter spacing (tight / normal / loose) for headings AND body
- Line height (compact / normal / relaxed)
- Font weight (regular / semibold / bold / extrabold)
- Text transform (none / uppercase / small-caps)
- Text shadow glow intensity (0-100%)
- Drop cap on first letter of About / Quote blocks

**Layout micro-adjustments**:
- Block padding density (compact / comfortable / spacious)
- Finer border radius control (0 / 4 / 8 / 12 / 16 / 24 / 32 / full)
- Card shadow intensity (none / subtle / normal / dramatic)
- Section spacing between blocks (compact / normal / roomy)

**Color micro-adjustments**:
- Saturation of the template accent (muted / normal / vivid)
- Contrast dial for accessibility (low / normal / high)
- Gradient angle for the background (0-360°)
- Mesh gradient density

**Motion**:
- Animation duration multiplier (0.5x / 1x / 1.5x / 2x)
- Hover lift amount (none / subtle / dramatic)
- Parallax strength on images (none / subtle / strong)

**Decorations**:
- Signature particle count (0-100%)
- Signature particle speed (slow / normal / fast)
- Cursor effect opacity (0-100%)

**Images**:
- Image border radius (independent of template radius)
- Image filter (none / warm / cool / B&W / vintage / soft)
- Image border (none / thin / thick / gradient)

**Per-template signature wow moments**:
- Rose → falling peony petals by default
- Aura → fireflies and shimmer
- Edge → subtle grid pulse
- Pop → confetti on first scroll
- Studio → clean reveal animations
- Luxe → gold shimmer

Each template should feel like an identity the first second the page loads, not just a color scheme. Budget: 1-2 focused sessions.

---

## Debugging Deployment Errors

**ALWAYS run `npm run build` first** when the deployed site shows errors. TypeScript build failures are the most common cause — not missing env vars. Don't send the user chasing environment variable issues until you've confirmed the build passes clean locally.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (RUN THIS FIRST when debugging deploy issues)
npx shadcn add X     # Add a shadcn/ui component
```

## Database

Core tables: `providers`, `services`, `availability_rules`, `availability_overrides`, `bookings`, `personal_events`, `calendar_connections`, `external_busy_times`, `notifications`, `digital_products`, `digital_product_sales`.

All tables have RLS, UUID PKs, `created_at`/`updated_at` timestamps. Migrations are numbered and additive — run them in order on a fresh Supabase project:

- `00001_initial_schema.sql` — base schema, RLS, indexes
- `00002_cancellation_policies.sql` — `bookings.cancellation_token`, `cancelled_at`, `cancellation_reason`, `refund_amount_cents`
- `00003_page_builder.sql` — `digital_products` + `digital_product_sales` tables, `page-assets` + `digital-products` storage buckets
- `00005_service_buffers.sql` — nullable `buffer_before_minutes` / `buffer_after_minutes` on `services` (NULL = inherit provider default)

`providers.branding` is an extensible JSONB bag. Keys currently in use: `template`, `primary_color`, `address`, `booking_calendar_range`, `default_slot_minutes`, `default_buffer_before_minutes`, `default_buffer_after_minutes`, `page_blocks`. Adding new knobs here does NOT need a migration.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- Supabase URL + anon key + service role key
- Stripe secret key + webhook secret + publishable key
- Resend API key
- App URL

## Implementation Status

### Done
- **Phase 1**: Auth, onboarding, services CRUD, availability, public booking, Stripe checkout + webhook, Stripe Connect (destination charges)
- **Template System**: 6 templates (Aura, Bloom, Edge, Luxe, Pop, Studio), themed components, animations, decorations, template picker in settings
- **Dashboard**: All 12 pages built — dashboard home, bookings list + detail, services, availability, clients, calendar (stub), integrations (stub), payments, settings, preview (Client View)
- **Landing Page**: Redesigned with gradient hero, floating orbs, template showcase
- **Cancellation System**: Policy editor in settings, cancellation token generation, client-facing cancel page (`/cancel/[token]`), refund calculation logic

### Shipped since Phase 1 kickoff
- **Your Page widget builder** — 8 widgets (Hero, About, Gallery, Services, Quote, Link, Contact, Digital Product), drag-and-drop, live iframe preview via postMessage, template bar. Blocks stored in `providers.branding.page_blocks`. Digital products have signed-URL downloads with 7-day expiry.
- **Trust layer, data export, themed availability calendar, booking polish**
- **Date override ranges, slot interval + per-service buffers, CSV Everything export, JSON import** (2026-04-12 tester-finding fast fixes)

### Current "not done yet" list
- **Email confirmations**: `sendBookingConfirmation()` exists in `src/lib/resend.ts` but is **never called**. Needs wiring into the Stripe webhook (after booking insert) and the free-booking checkout path. Also needs the cancellation token in the email body.
- **Stripe refunds**: `src/app/api/cancel/[token]/route.ts` calculates `refund_amount_cents` but the actual `stripe.refunds.create()` call is commented out. Needs uncommenting + handling Connect destination charges.
- **Analytics**: No tracking wired up yet. PostHog or Plausible — pick one and ship it before the tester checkpoint or we're flying blind.
- **OG share preview + QR code**: Phase 1 Task 8. Branded share cards via Next.js `ImageResponse`, plus a dashboard QR generator.
- **Tester checkpoint**: hand the live deploy to Allie's hairstylist + therapist after the above three ship. Pause feature work and fix whatever they find before touching Phase 2.

### Planned Roadmap (full details in `~/.claude/plans/velvety-jingling-yeti.md`)

**Revised after honest critique 2026-04-09.** Two new principles:
1. Real users (Allie's hairstylist + therapist) test and report bugs after Phase 1 — debugging happens between feature work
2. Billing only after they've validated the product

**🔥 Phase 1 — Foundation (validate the loop)**
- **Task 3**: Email confirmations
- **Task 4**: Stripe refunds
- **Task 5** ⭐: Branded confirmation page + calendar + directions
- **Task 6** ⭐ **NEW**: PWA setup (installable, offline shell, app icon)
- **Task 7** ⭐ **NEW**: Analytics (PostHog or Plausible)
- **Task 8** ⭐: OG share preview + QR code generator
- **Task 9** ⭐: Page customization layer (font/color overrides)
- **CHECKPOINT**: Hand to Allie's hairstylist + therapist for end-to-end testing. Pause feature work and fix what they find.

**📅 Phase 2 — The calendar hero + power features**
- **Task 10** 🔥 **PROMOTED**: Gorgeous color-coded calendar (week/day/month, drag-to-reschedule). The dashboard's most important screen. ✅ DONE (2026-04-12, shipped as part of session before tester checkpoint).
- **Recurring bookings** ⭐ **NEW PRIORITY** (requested 2026-04-13): clients can book "every Wednesday at noon" as a series. Per-service toggle. Frequency (weekly / bi-weekly / monthly) + end condition (N occurrences / until date / ongoing). Conflict handling: skip occurrences that collide with existing bookings or overrides, show summary at checkout. Deposit charged once upfront for the whole series. New `booking_series` parent table + `series_id` column on bookings. Cancellation UX: "cancel this one" vs "cancel this and all future". Availability-override changes that land on a series occurrence should auto-cancel + email both sides. FOLLOW-UP: waitlist-for-extension — when provider opens a new month, recurring clients get a notification asking if they want to extend. This is the #1 unsolicited request from Allie, so it's the top Phase 2 build after the tester checkpoint.
- **Task 11** ⭐ **PROMOTED**: SMS via Twilio (older clients prefer texts)
- Task 12: Smart reminders (re-booking nudges)
- Task 13: Pre-appointment reminders (24h/1h)
- Task 14 ⭐: Pre/post-appointment care guides
- Task 15: Intake forms per service
- Task 16 ⭐: Service explainer videos

**🏢 Phase 3 — Team & client features**
- Task 17: Multi-staff support
- **Task 18** ⭐ **NEW**: Client accounts (login, "my bookings", saved preferences)
- Task 19: Client profiles with memory + provider notes
- Task 20: Service add-ons
- Task 21 ⭐: Live availability + social proof counters

**💰 Phase 4 — Growth & retention**
- Task 22: Discounts, referrals, loyalty
- Task 23 ⭐: Bring-a-friend group discount
- Task 24 ⭐: Birthday discount auto-apply
- Task 25: Waitlist with smart notifications
- Task 26: Reviews (Google import + native)
- Task 27: Before/after portfolio

**💳 Phase 5 — Monetization (only after testers validate)**
- **Task 28** 💰 **NEW**: Stripe billing for providers (subscriptions, trial)
- Task 29: Provider pricing page + plan tiers
- Task 30: Provider billing dashboard

**✨ Phase 6 — Wow polish**
- Task 31 ⭐: AI service recommender (Claude API)
- Task 32: Privacy policy & legal templates
- Task 33: Social feed / content hub

**🛑 Cut/deferred** (from critique):
- Live chat bubble — defer until paying users request it
- Flyer/poster generator — defer
- Multi-language — one language until PMF
- Onboarding tour — folded into Task 18 (client accounts)

**🚀 Future (huge — separate project)**:
- Task 34: Multi-business / cross-vertical (hair + pet sitting)

### Done This Session (2026-04-09)
- Dashboard font overhaul (Plus Jakarta Sans body + Fraunces serif headings)
- Magazine-style Availability + Integrations pages
- Themed services list (template-aware)
- **Your Page widget builder** — Shopify-style page builder with 8 widgets (Hero, About, Gallery, Services, Quote, Link, Contact, Digital Product), drag-and-drop, live iframe preview, template bar
- Migration 00003 + storage buckets (`page-assets`, `digital-products`)
- Digital products with Stripe checkout, signed download links, expiration
- Removed template picker + landing editor from Settings (moved to Your Page)
- Fixed runtime errors throughout the booking flow

### Done This Session (2026-04-09)
- Dashboard font overhaul (Plus Jakarta Sans body + Fraunces serif headings)
- Magical landing hero (LandingHero component with staggered entrance + theme glow)
- Themed services list (template-aware fonts, big emoji bubbles, color glows)
- Magazine-style Availability page (gradient orbs, day-row toggles, premium dots)
- Magazine-style Integrations page (hero, perks, premium calendar cards)
- Fixed runtime errors: `formatPrice` server→client passing, missing cancellation files in git, TypeScript build errors
- Added visible error states throughout booking flow
- Dedicated `/book/[slug]/services` route (separates landing from services)
