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
- **Deploy**: Vercel

## Project Structure

```
src/
  app/
    (auth)/          # login, signup, callback, onboarding
    (dashboard)/     # provider dashboard (authenticated, sidebar layout)
    book/[slug]/     # public booking page (themed per-business)
    api/             # route handlers (availability, bookings, stripe, cron)
  components/
    ui/              # shadcn/ui (DO NOT edit manually — use `npx shadcn add`)
    booking/         # booking flow components
    calendar/        # calendar view components (Phase 2)
    dashboard/       # sidebar, stats, lists
  lib/
    supabase/        # client.ts (browser), server.ts (SSR), admin.ts (service role)
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

## Key Patterns

- **shadcn/ui v4 uses base-ui, NOT radix.** Buttons do NOT support `asChild`. For link-buttons use `buttonVariants()` on a `<Link>` element.
- **Supabase types**: Every table in `database.ts` MUST have `Relationships: []` or the Supabase client resolves Insert/Update types to `never`.
- **Stripe**: Use `getStripe()` (lazy init) instead of a top-level `new Stripe()` to avoid build errors when env vars aren't set.
- **Dynamic rendering**: Auth and dashboard layouts use `export const dynamic = "force-dynamic"` because they depend on Supabase auth.
- **Server Actions** for provider CRUD (services, availability). **API routes** for public endpoints (availability slots, bookings, Stripe).
- **RLS on every table**. Public booking pages use anon key with restrictive SELECT policies.
- **Availability engine** (`src/lib/availability.ts`) is the core algorithm — handles rules, overrides, existing bookings, external busy times, and timezone conversion.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npx shadcn add X     # Add a shadcn/ui component
```

## Database

9 tables: providers, services, availability_rules, availability_overrides, bookings, personal_events, calendar_connections, external_busy_times, notifications.

Migration at `supabase/migrations/00001_initial_schema.sql`. All tables have RLS, UUID PKs, created_at/updated_at timestamps.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- Supabase URL + anon key + service role key
- Stripe secret key + webhook secret + publishable key
- Resend API key
- App URL

## Implementation Phases

- **Phase 1** (DONE): Auth, onboarding, services CRUD, availability, public booking, Stripe Connect, email confirmation
- **Phase 2**: Dashboard analytics (top spenders, revenue), calendar week view, personal events, booking management
- **Phase 3**: SMS + WhatsApp via Twilio, notification preferences, reminders cron
- **Phase 4**: Google/Outlook/Apple/Proton calendar two-way sync
- **Phase 5**: Per-business branding customization, theme presets
- **Phase 6**: Rescheduling, recurring appointments, waitlist, multi-provider
