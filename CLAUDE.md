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

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
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

- **Phase 1** (DONE): Auth, onboarding, services CRUD, availability, public booking, Stripe Connect, email confirmation
- **Template System** (DONE): 6 templates, themed components, animations, decorations, template picker in settings
- **Phase 2**: Dashboard analytics, calendar week view, personal events
- **Phase 3**: SMS + WhatsApp via Twilio, notification preferences, reminders
- **Phase 4**: Google/Outlook/Apple/Proton calendar two-way sync
- **Phase 6**: Rescheduling, recurring appointments, waitlist, multi-provider
