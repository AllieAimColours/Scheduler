# Scheduler

Booking/scheduling SaaS for hair stylists and therapists. Providers set up services, availability, and branding, then share a public booking link where clients pick a service, choose a time, pay via Stripe, and get confirmed.

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

### Pricing hypothesis (strawman for Phase 5)
Free / $14 Starter / $29 Pro / $79 Salon. Real pricing comes from talking to real users — this is the starting point, not the answer.

### Weekly tester cadence
Friday Loom + 3 specific questions + take notes in `tester-feedback.md` + thank-yous every 2-3 weeks. Engaged testers stay engaged.

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

9 tables: providers, services, availability_rules, availability_overrides, bookings, personal_events, calendar_connections, external_busy_times, notifications.

Migration at `supabase/migrations/00001_initial_schema.sql`. All tables have RLS, UUID PKs, created_at/updated_at timestamps.

Provider branding stored as JSON: `{ template: "bloom", primary_color: "#hex" }`

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

### In Progress: "Your Page" — Widget-Based Page Builder
**Concept**: Replace the simple landing-page settings with a full page builder. Provider picks a template at the top, then drags widget blocks (Hero, About, Gallery, Services, Quote, Link, Contact, Digital Product) onto their public booking page. Each widget is themed via `useTemplate()` and inherits the active template's fonts/colors/animations.

**v1 widgets (8 essentials)**:
1. **Hero** — image, name, tagline, welcome message, CTA
2. **About** — bio + photo, optional credentials
3. **Image Gallery** — grid of photos (portfolio)
4. **Services** — inline service cards
5. **Quote / Testimonial** — client review with name + photo
6. **Link Card** — external link with thumbnail (Linktree-style)
7. **Contact** — phone, email, address
8. **Digital Product** — sell e-books/guides with cover, preview, Stripe checkout

**v2 widgets** (after Task 9 social feed): Instagram feed, TikTok feed, YouTube, Article/Blog, Before/After slider, Embed, Spacer/Divider

**Architecture**:
- New sidebar item "Your Page" replaces template picker + landing editor in Settings
- Top bar: 6 templates as horizontal pills, click to switch instantly
- Two-column layout: block library/list (left) + live iframe preview (right)
- Drag-and-drop reordering via `@dnd-kit/core` + `@dnd-kit/sortable`
- Block config stored in `providers.branding.page_blocks` JSONB array
- Each block = `{ id, type, config }` rendered by template-aware components
- Image uploads → Supabase Storage bucket `page-assets`
- Digital products → new `digital_products` table

**Digital product delivery (option C)**:
- After Stripe checkout: redirect to download page + email signed link
- Signed URLs expire in 7 days
- Sales tracked in `digital_product_sales` table

**Files to create**:
- `supabase/migrations/00003_page_builder.sql` — digital_products + digital_product_sales tables, page-assets storage bucket
- `src/app/(dashboard)/your-page/page.tsx` — main builder UI
- `src/components/your-page/template-bar.tsx` — top template picker
- `src/components/your-page/block-library.tsx` — sidebar of available blocks
- `src/components/your-page/block-list.tsx` — sortable list of current blocks
- `src/components/your-page/preview-pane.tsx` — iframe live preview
- `src/components/your-page/blocks/*.tsx` — editor for each block type
- `src/components/booking/blocks/*.tsx` — public renderers for each block (themed)
- `src/lib/page-builder/types.ts` — block type definitions
- `src/lib/page-builder/defaults.ts` — default config for each block type
- `src/app/api/digital-products/checkout/route.ts` — Stripe checkout for products
- `src/app/api/digital-products/webhook/route.ts` — fulfillment on payment
- `src/app/download/[token]/page.tsx` — download landing page

**Files to modify**:
- `src/app/book/[slug]/page.tsx` — render blocks from `branding.page_blocks` instead of fixed LandingHero
- `src/components/dashboard/app-sidebar.tsx` — add "Your Page" nav item
- `src/app/(dashboard)/settings/page.tsx` — remove template picker + landing editor
- `src/types/database.ts` — add digital_products table types

### Other Outstanding Work (paused while building Your Page)
- **Email confirmations**: `sendBookingConfirmation()` exists in `src/lib/resend.ts` but is **never called** — needs wiring into webhook + free booking path
- **Stripe refunds**: Cancellation calculates refund amount but **doesn't call Stripe API** — commented-out code in cancel route
- **Cancellation policy save**: User reports save fails — likely migration `00002_cancellation_policies.sql` not run on Supabase yet (user is running it manually now)

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
- **Task 10** 🔥 **PROMOTED**: Gorgeous color-coded calendar (week/day/month, drag-to-reschedule). The dashboard's most important screen.
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
