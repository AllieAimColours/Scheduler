import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CreditCard,
  Sparkles,
  Palette,
  Smartphone,
  Shield,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TEMPLATES, TEMPLATE_IDS } from "@/lib/templates/index";
import { HeroPlayground, HeroPlaygroundInline } from "@/components/marketing/hero-playground";
import { TemplatePreviewCard } from "@/components/marketing/template-preview-card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            Bloom
          </span>
          <span className="font-script text-2xl text-gray-900 leading-none -translate-y-0.5">
            rendez-vous
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants(),
              "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0 text-white"
            )}
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
          <div className="absolute top-60 left-1/2 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000" />
        </div>

        {/* Interactive playground — falling petals + cursor sparkles + click bursts */}
        <HeroPlayground />

        <div className="max-w-5xl mx-auto px-6 pt-12 lg:pt-24 pb-20 text-center">
          {/* Mobile playground — inline between nav and the hero pill */}
          <HeroPlaygroundInline />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            Not another boring scheduling tool
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-gray-900 leading-[1.1]">
            Where bookings
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              bloom into experiences
            </span>
          </h1>

          <p className="text-xl text-gray-500 mt-8 max-w-2xl mx-auto leading-relaxed">
            The booking platform that doesn&apos;t look like a spreadsheet.
            Pick a vibe, add your services, share your link. Your rendez-vous page
            transforms into an experience your clients will love.
          </p>

          <div className="mt-12 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0 text-white px-8 h-12 text-base"
              )}
            >
              Start for Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section className="py-24 bg-gray-50/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              6 vibes. Every kind of business.
            </h2>
            <p className="text-lg text-gray-500 mt-4 max-w-xl mx-auto">
              From hair stylists to IVF clinics, nail salons to therapy practices —
              each template is a complete design language that bends to your brand.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATE_IDS.map((id, idx) => (
              <TemplatePreviewCard
                key={id}
                template={TEMPLATES[id]}
                staggerOffset={idx * 600}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Palette,
                title: "Your Brand, Your Vibe",
                description:
                  "6 stunning templates that change everything — fonts, colors, animations, the whole feel. Your booking page, your personality.",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: Calendar,
                title: "Calendar Sync",
                description:
                  "Google, Outlook, Apple, Proton — your availability stays accurate. Two-way sync so bookings appear everywhere.",
                color: "bg-rose-100 text-rose-600",
              },
              {
                icon: CreditCard,
                title: "Payments Built In",
                description:
                  "Stripe-powered. Clients pay when they book — full price or deposit. Money goes straight to your bank account.",
                color: "bg-emerald-100 text-emerald-600",
              },
              {
                icon: Smartphone,
                title: "SMS + WhatsApp",
                description:
                  "Automatic confirmations and reminders via text, WhatsApp, and email. Clients never miss their appointment.",
                color: "bg-amber-100 text-amber-600",
              },
              {
                icon: Clock,
                title: "Smart Scheduling",
                description:
                  "Set your hours, block off dates, configure buffer time. The system handles conflicts and timezone math.",
                color: "bg-sky-100 text-sky-600",
              },
              {
                icon: Shield,
                title: "Notes on Both Sides",
                description:
                  'Clients leave notes at booking. You add private notes for your records. "Wants balayage, bringing reference photos."',
                color: "bg-pink-100 text-pink-600",
              },
            ].map((feature) => (
              <div key={feature.title} className="space-y-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    feature.color
                  )}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to make booking beautiful?
          </h2>
          <p className="text-lg text-white/80 mt-4">
            Free to start. Takes 2 minutes to set up.
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-purple-700 hover:bg-gray-100 border-0 px-8 h-12 text-base font-semibold"
              )}
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-gray-400 border-t">
        <p>Made with care for the beauty and wellness community</p>
      </footer>
    </div>
  );
}
