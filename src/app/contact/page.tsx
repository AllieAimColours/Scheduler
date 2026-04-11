import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Shield, Sparkles, MessageCircle } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Contact — Bloom · Rendez-vous",
  description:
    "Get in touch with the Bloom team. We read and reply to every message.",
};

const CONTACTS = [
  {
    icon: Sparkles,
    title: "General inquiries & support",
    email: "hello@bloomrdv.com",
    description:
      "Product questions, feature requests, feedback, partnerships, press. We read everything and reply within 2 business days.",
    accent: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Security vulnerabilities",
    email: "security@bloomrdv.com",
    description:
      "Found something? Please report it responsibly. We acknowledge within 48 hours and credit you in our security page (with permission).",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: MessageCircle,
    title: "Enterprise & large teams",
    email: "hello@bloomrdv.com",
    description:
      "Need 16+ staff, custom integrations, white-label, or a dedicated SLA? Let's talk.",
    accent: "from-purple-500 to-pink-500",
  },
];

export default function ContactPage() {
  return (
    <MarketingShell
      title="Contact us"
      subtitle="We read and reply to every message. No support tickets, no bots."
    >
      <div className="grid gap-5 not-prose">
        {CONTACTS.map((c) => (
          <a
            key={c.email + c.title}
            href={`mailto:${c.email}`}
            className="group flex items-start gap-4 p-6 rounded-2xl border border-gray-100 bg-white hover:border-pink-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <div
              className={`shrink-0 inline-flex p-3 rounded-2xl bg-gradient-to-br ${c.accent} shadow-lg`}
            >
              <c.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl font-bold text-gray-900 mb-1">
                {c.title}
              </div>
              <div className="text-sm text-gray-500 mb-3 leading-relaxed">
                {c.description}
              </div>
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-pink-600">
                <Mail className="h-3.5 w-3.5" />
                {c.email}
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-sm text-pink-600 hover:underline">
          ← Back to Bloom
        </Link>
      </div>
    </MarketingShell>
  );
}
