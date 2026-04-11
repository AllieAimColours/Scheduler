import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — Bloom · Rendez-vous",
  description:
    "How Bloom collects, uses, and protects your data. Read our privacy policy.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your data — plain English, no dark patterns."
    >
      <p className="text-sm text-gray-400">Last updated: April 11, 2026</p>

      <div className="callout">
        <p>
          <strong>The short version</strong>: We collect only what we need to
          run your booking page and process payments. We never sell your data.
          You can export or delete everything at any time. Questions? Email{" "}
          <a href="mailto:hello@bloomrdv.com">hello@bloomrdv.com</a>.
        </p>
      </div>

      <h2>Who we are</h2>
      <p>
        Bloom · Rendez-vous (&quot;Bloom&quot;, &quot;we&quot;, &quot;us&quot;) is a booking platform for
        hair stylists, beauty professionals, therapists, and creative service
        providers. We operate <a href="https://bloomrdv.com">bloomrdv.com</a>.
      </p>

      <h2>What we collect</h2>
      <h3>From providers (the people running their business on Bloom)</h3>
      <ul>
        <li>Email address and business name you provide at signup</li>
        <li>Services, prices, availability rules, and page customization</li>
        <li>
          Stripe Connect account information (for providers who accept
          payments) — note that card details are handled directly by Stripe
          and never touch our servers
        </li>
        <li>Basic usage analytics to improve the product</li>
      </ul>

      <h3>From clients (the people booking appointments)</h3>
      <ul>
        <li>Name, email, phone number provided during booking</li>
        <li>Appointment notes the client chooses to share</li>
        <li>Payment information — processed directly by Stripe</li>
      </ul>

      <h2>What we do NOT collect</h2>
      <ul>
        <li>We do not collect or store credit card numbers (Stripe does)</li>
        <li>We do not track you across other websites</li>
        <li>We do not sell, trade, or rent personal information to third parties</li>
        <li>We do not run targeted ads</li>
      </ul>

      <h2>How we use your data</h2>
      <ul>
        <li>
          To operate your booking page (show services, schedule appointments,
          send confirmations)
        </li>
        <li>To process payments via Stripe</li>
        <li>To send transactional emails (confirmations, reminders, receipts)</li>
        <li>
          To provide customer support when you contact us
        </li>
        <li>To improve the product (aggregated, non-identifying analytics)</li>
      </ul>

      <h2>Where your data lives</h2>
      <p>
        Data is stored on <strong>Supabase</strong> (PostgreSQL hosted in the
        EU / US depending on your region) with row-level security enforced for
        every query. Files (hero images, page assets, digital products) live
        in Supabase Storage. Our application runs on{" "}
        <strong>Vercel</strong> over TLS. Payment data is handled by{" "}
        <strong>Stripe</strong>, a PCI-DSS Level 1 certified provider.
      </p>

      <h2>Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Access</strong> all data we have about you — available via
          the data export tool in your dashboard
        </li>
        <li>
          <strong>Export</strong> your data in CSV and JSON format at any time
        </li>
        <li>
          <strong>Correct</strong> any inaccurate information directly in the
          dashboard
        </li>
        <li>
          <strong>Delete</strong> your account and all associated data — email{" "}
          <a href="mailto:hello@bloomrdv.com">hello@bloomrdv.com</a> and we
          will action your request within 30 days
        </li>
        <li>
          <strong>Object</strong> to specific uses of your data — contact us
          to discuss
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use essential cookies for authentication (so you stay logged in)
        and a minimal set of analytics cookies to measure how the product is
        used. We do not use advertising or cross-site tracking cookies.
      </p>

      <h2>Data retention</h2>
      <p>
        Active accounts: data is retained as long as your account is active.
      </p>
      <p>
        Closed accounts: data is deleted within 30 days of account closure,
        except for records we are legally required to keep (e.g. invoices for
        tax compliance, typically 7 years depending on jurisdiction).
      </p>

      <h2>Children</h2>
      <p>
        Bloom is not intended for use by anyone under 16. We do not knowingly
        collect data from children under 16. If you believe a child has
        provided us with personal information, please contact us immediately.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        communicated via email to all registered providers at least 30 days
        before they take effect. The &quot;last updated&quot; date at the top will
        always reflect the most recent revision.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions, concerns, or data requests? Email{" "}
        <a href="mailto:hello@bloomrdv.com">hello@bloomrdv.com</a>. We aim to
        respond within 2 business days.
      </p>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-sm text-pink-600 hover:underline">
          ← Back to Bloom
        </Link>
      </div>
    </MarketingShell>
  );
}
