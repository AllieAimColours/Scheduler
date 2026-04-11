import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Terms of Service — Bloom · Rendez-vous",
  description: "The terms that govern your use of Bloom · Rendez-vous.",
};

export default function TermsPage() {
  return (
    <MarketingShell
      title="Terms of Service"
      subtitle="The ground rules for using Bloom — in plain English where we can."
    >
      <p className="text-sm text-gray-400">Last updated: April 11, 2026</p>

      <div className="callout">
        <p>
          <strong>TL;DR</strong>: Use Bloom to run your beautiful booking page.
          Don&apos;t use it for anything illegal or abusive. We charge for paid
          plans and will refund pro-rated if you cancel. We may suspend
          accounts that violate these terms or put others at risk. Full legal
          language below.
        </p>
      </div>

      <h2>1. Acceptance of terms</h2>
      <p>
        By creating an account or using Bloom · Rendez-vous (&quot;Bloom&quot;,
        &quot;we&quot;, &quot;us&quot;, &quot;the service&quot;), you agree to these Terms of Service.
        If you don&apos;t agree, don&apos;t use the service.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 16 years old to use Bloom. You must have the
        legal authority to enter into this agreement on behalf of yourself or
        your business.
      </p>

      <h2>3. Your account</h2>
      <p>
        You are responsible for maintaining the security of your account
        credentials. You are responsible for all activity that occurs under
        your account. Notify us immediately at{" "}
        <a href="mailto:hello@bloomrdv.com">hello@bloomrdv.com</a> if you
        suspect unauthorized access.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree NOT to:</p>
      <ul>
        <li>Use Bloom for any illegal, fraudulent, or deceptive purpose</li>
        <li>Sell regulated goods or services that require licenses you don&apos;t hold</li>
        <li>Harass, abuse, or harm clients or other users</li>
        <li>Attempt to gain unauthorized access to other accounts or our systems</li>
        <li>Scrape, reverse-engineer, or interfere with the service</li>
        <li>Resell, sublicense, or white-label Bloom without a Studio plan or higher</li>
        <li>Send spam or unsolicited communications through the service</li>
      </ul>
      <p>
        We may suspend or terminate accounts that violate these rules, with
        or without notice depending on severity.
      </p>

      <h2>5. Payments and billing</h2>
      <h3>Provider subscriptions</h3>
      <p>
        Paid plans are billed monthly unless otherwise specified. Prices are
        listed on our <Link href="/#pricing">pricing page</Link>. All paid
        plans include a 14-day free trial with no credit card required. You
        can cancel at any time from your dashboard — your plan remains active
        until the end of the current billing period.
      </p>

      <h3>Bookings and client payments</h3>
      <p>
        Clients pay providers directly through Stripe Connect. Bloom may
        charge a platform fee on each transaction, clearly disclosed in your
        payments settings. Stripe processing fees are separate and charged by
        Stripe.
      </p>

      <h3>Refunds</h3>
      <p>
        Subscription fees are refundable pro-rata for the unused portion if
        you cancel within 30 days of your billing cycle. Client booking
        refunds follow the cancellation policy each provider configures on
        their own booking page.
      </p>

      <h2>6. Your content</h2>
      <p>
        You retain full ownership of everything you upload to Bloom (business
        info, service descriptions, hero images, gallery photos, client
        notes, etc.). By uploading, you grant us a limited license to store,
        display, and transmit your content solely for the purpose of
        operating the service.
      </p>

      <h2>7. Our intellectual property</h2>
      <p>
        Bloom, the Bloom logo, the &quot;Rendez-vous&quot; wordmark, all templates,
        the page builder, and all underlying code are owned by us. You may
        not copy, modify, distribute, or create derivative works of any of
        these without our written permission.
      </p>

      <h2>8. Service availability</h2>
      <p>
        We aim for high availability but do not guarantee 100% uptime.
        Planned maintenance will be announced in advance. We are not liable
        for losses caused by service interruptions, though we will always
        work quickly to restore service.
      </p>

      <h2>9. Disclaimer of warranties</h2>
      <p>
        Bloom is provided &quot;as is&quot; without warranties of any kind. We do not
        warrant that the service will be uninterrupted, error-free, or
        completely secure.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Bloom&apos;s total liability for
        any claim arising from your use of the service is limited to the
        amount you paid us in the 12 months preceding the claim.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Material changes will be
        communicated via email at least 30 days before they take effect.
        Continued use of the service after changes take effect constitutes
        acceptance.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These terms are governed by the laws of the jurisdiction in which
        Bloom is operated. Disputes will be resolved in the courts of that
        jurisdiction, unless otherwise required by local consumer protection
        laws.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href="mailto:hello@bloomrdv.com">hello@bloomrdv.com</a>.
      </p>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-sm text-pink-600 hover:underline">
          ← Back to Bloom
        </Link>
      </div>
    </MarketingShell>
  );
}
