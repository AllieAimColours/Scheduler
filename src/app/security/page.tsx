import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Security & Compliance — Bloom · Rendez-vous",
  description:
    "How Bloom keeps your data and your clients' payments safe: encryption, Stripe PCI-DSS, row-level security, responsible disclosure.",
};

export default function SecurityPage() {
  return (
    <MarketingShell
      title="Security & Compliance"
      subtitle="How we keep your data and your clients' payments safe."
    >
      <div className="callout">
        <p>
          <strong>The short version</strong>: Payments go through{" "}
          <strong>Stripe</strong> (PCI-DSS Level 1). Data lives on{" "}
          <strong>Supabase</strong> with row-level security and
          encryption at rest. Everything runs over <strong>TLS 1.3</strong>.
          You own your data and can export it any time.
        </p>
      </div>

      <h2>Payments: handled by Stripe</h2>
      <p>
        Bloom never sees, stores, or transmits your clients&apos; card numbers.
        All payment processing is handled directly by{" "}
        <a
          href="https://stripe.com/docs/security"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stripe
        </a>
        , a <strong>PCI-DSS Level 1</strong> certified payment processor —
        the highest certification tier for payment security. Stripe is
        trusted by millions of businesses worldwide including Shopify, Lyft,
        Amazon, and Google.
      </p>
      <p>
        When a client pays for a booking:
      </p>
      <ol>
        <li>
          The card details are entered in a Stripe-hosted checkout page
          (never in a Bloom form)
        </li>
        <li>Stripe tokenizes the payment and charges the card</li>
        <li>
          Bloom only receives a confirmation token and the amount charged —
          never the card number
        </li>
        <li>
          Funds are deposited directly into the provider&apos;s connected Stripe
          account (Stripe Connect, destination charges model)
        </li>
      </ol>

      <h2>Data storage and encryption</h2>
      <p>
        Your data lives on <strong>Supabase</strong>, a managed PostgreSQL
        platform running on AWS infrastructure with:
      </p>
      <ul>
        <li>
          <strong>Encryption at rest</strong> — all database storage is
          encrypted using AES-256
        </li>
        <li>
          <strong>Encryption in transit</strong> — every connection uses TLS
          1.3
        </li>
        <li>
          <strong>Row-level security</strong> — every database query is
          filtered by the authenticated user&apos;s permissions at the database
          level, so a bug in application code cannot leak another provider&apos;s
          data
        </li>
        <li>
          <strong>Daily automated backups</strong> with point-in-time
          recovery
        </li>
      </ul>

      <h2>Application hosting</h2>
      <p>
        Bloom runs on <strong>Vercel</strong>, which provides automatic HTTPS
        with TLS 1.3, DDoS protection, and a global edge network with
        SOC 2 Type 2 certification. All traffic is served over HTTPS — we
        do not accept plain-HTTP requests.
      </p>

      <h2>Authentication</h2>
      <p>
        User accounts are managed through <strong>Supabase Auth</strong>{" "}
        with:
      </p>
      <ul>
        <li>Bcrypt password hashing (never plaintext)</li>
        <li>Secure HTTP-only session cookies</li>
        <li>Optional magic-link sign-in (no password to leak)</li>
        <li>Email verification on sign-up</li>
      </ul>

      <h2>Your data, your control</h2>
      <p>
        You own everything you put into Bloom. From your dashboard you can:
      </p>
      <ul>
        <li>
          <strong>Export all your data</strong> as CSV or JSON at any time
          (bookings, clients, services, payment records)
        </li>
        <li>
          <strong>Delete your account</strong> — we remove all your data
          within 30 days, keeping only records legally required for tax
          compliance
        </li>
        <li>
          <strong>Control what your clients see</strong> — you choose your
          branding, services, and the notifications they receive
        </li>
      </ul>

      <h2>What we do NOT do</h2>
      <ul>
        <li>We do not sell, trade, or rent your data — ever</li>
        <li>We do not train AI models on your client information</li>
        <li>We do not use advertising or cross-site tracking cookies</li>
        <li>We do not store credit card numbers on our servers</li>
        <li>We do not share your data with third parties except:
          <ul>
            <li>Stripe (to process payments)</li>
            <li>Resend (to send transactional emails)</li>
            <li>Twilio (to send SMS, if you enable it)</li>
            <li>Supabase (our database provider)</li>
            <li>Vercel (our hosting provider)</li>
          </ul>
        </li>
      </ul>

      <h2>Responsible disclosure</h2>
      <p>
        If you&apos;ve found a security vulnerability in Bloom, please report it
        responsibly. Email{" "}
        <a href="mailto:security@bloomrdv.com">security@bloomrdv.com</a>{" "}
        with:
      </p>
      <ul>
        <li>A clear description of the issue</li>
        <li>Steps to reproduce</li>
        <li>The potential impact</li>
      </ul>
      <p>
        We commit to: acknowledging your report within 48 hours, investigating
        promptly, keeping you informed of progress, and crediting you in our
        security page (with your permission) once the issue is resolved.
        Please do not publicly disclose a vulnerability before we&apos;ve had
        time to fix it.
      </p>

      <h2>Compliance</h2>
      <p>
        We design Bloom with privacy laws in mind — GDPR, CCPA, and similar.
        Your rights to access, export, and delete your data are first-class
        features, not afterthoughts. For questions about your specific
        compliance needs, reach out to{" "}
        <a href="mailto:hello@bloomrdv.com">hello@bloomrdv.com</a>.
      </p>

      <h2>Stay informed</h2>
      <p>
        Read our <Link href="/privacy">Privacy Policy</Link> for more on how
        we handle personal data, and our <Link href="/terms">Terms of
        Service</Link> for the contractual details.
      </p>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-sm text-pink-600 hover:underline">
          ← Back to Bloom
        </Link>
      </div>
    </MarketingShell>
  );
}
