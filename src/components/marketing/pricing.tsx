import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Try the magic",
    features: [
      "1 staff member",
      "All 6 templates",
      "Page builder",
      "15 bookings / month",
      "Powered by Bloom footer",
    ],
    cta: "Start free",
    ctaHref: "/signup",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    period: "/ month",
    tagline: "For solo providers",
    features: [
      "1 staff member",
      "Unlimited bookings",
      "Custom branding (no footer)",
      "Email confirmations",
      "All wow effects",
      "All 8 widgets",
    ],
    cta: "Start 14-day trial",
    ctaHref: "/signup?plan=starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39",
    period: "/ month",
    tagline: "Where the magic lives",
    features: [
      "Everything in Starter",
      "SMS reminders",
      "Smart re-booking nudges",
      "Intake forms per service",
      "Client memory + color formulas",
      "Photos attached to bookings",
      "Sell digital products",
    ],
    cta: "Start 14-day trial",
    ctaHref: "/signup?plan=pro",
    popular: true,
  },
  {
    id: "salon",
    name: "Salon",
    price: "$79",
    period: "/ month",
    tagline: "For small teams",
    features: [
      "Everything in Pro",
      "2-5 staff members",
      "Per-staff schedules",
      "Team booking pages",
      '"Meet the team" widget',
      "Shared master calendar",
    ],
    cta: "Start 14-day trial",
    ctaHref: "/signup?plan=salon",
  },
  {
    id: "studio",
    name: "Studio",
    price: "$149",
    period: "/ month",
    tagline: "For full studios",
    features: [
      "Everything in Salon",
      "6-15 staff members",
      "Custom domain",
      "White label (no Bloom branding)",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Start 14-day trial",
    ctaHref: "/signup?plan=studio",
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="py-24 bg-gradient-to-b from-white via-pink-50/30 to-white scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
            Simple plans that{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              grow with you
            </span>
          </h2>
          <p className="text-lg text-gray-500 mt-5 max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready. Every paid plan includes
            a 14-day trial — no credit card required.
          </p>
        </div>

        {/* Plan grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Need more? */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Need 16+ staff or custom integrations?{" "}
            <a
              href="mailto:hello@bloomrdv.com"
              className="text-pink-600 font-semibold hover:underline"
            >
              Talk to us →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border bg-white p-6 flex flex-col transition-all duration-300 hover:-translate-y-1",
        plan.popular
          ? "border-pink-300 shadow-2xl shadow-pink-200/50 ring-2 ring-pink-400/50 lg:scale-105"
          : "border-gray-200 hover:border-pink-200 hover:shadow-xl"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
          ✨ Most popular
        </div>
      )}

      {/* Plan name + tagline */}
      <div className="mb-4">
        <h3 className="font-display text-2xl font-bold text-gray-900">
          {plan.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{plan.tagline}</p>
      </div>

      {/* Price */}
      <div className="mb-5 flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-4xl font-display font-bold",
            plan.popular
              ? "bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent"
              : "text-gray-900"
          )}
        >
          {plan.price}
        </span>
        <span className="text-sm text-gray-400">{plan.period}</span>
      </div>

      {/* CTA */}
      <Link
        href={plan.ctaHref}
        className={cn(
          "block text-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 mb-6",
          plan.popular
            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            : "bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-300 hover:text-pink-600"
        )}
      >
        {plan.cta}
      </Link>

      {/* Features */}
      <ul className="space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
            <Check
              className={cn(
                "h-4 w-4 mt-0.5 shrink-0",
                plan.popular ? "text-pink-500" : "text-green-500"
              )}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
