import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "About — Bloom · Rendez-vous",
  description:
    "Bloom · Rendez-vous is the magical booking platform for hair stylists, therapists, and creative service providers. Made with care.",
};

export default function AboutPage() {
  return (
    <MarketingShell
      title="About Bloom"
      subtitle="The booking platform for people who care about the experience — not just the transaction."
    >
      <h2>Why Bloom exists</h2>
      <p>
        Every booking tool out there looks like a spreadsheet. Calendly,
        Acuity, Square — they&apos;re all built for software people, not for the
        hair stylist who wakes up at 6am, pours coffee, opens her phone, and
        sees her day.
      </p>
      <p>
        Meanwhile, the actual work of a service provider is intimate. It&apos;s
        personal. A hair appointment isn&apos;t a database row — it&apos;s two hours
        of someone&apos;s day, a relationship, a before and after. A therapy
        session is a human helping another human through something hard.
      </p>
      <p>
        So why does the booking software look like an Excel sheet?
      </p>
      <p>
        Bloom is built around a different belief: <strong>the tool should
        feel as beautiful as the work it enables</strong>. Your booking page
        should feel like your studio. Your dashboard should feel like a
        morning coffee, not a compliance form. Every animation, every
        template, every button should respect the taste of the person using
        it.
      </p>

      <h2>Who it&apos;s for</h2>
      <p>
        Bloom is for people who take their craft seriously:
      </p>
      <ul>
        <li>Hair stylists, colorists, and barbers</li>
        <li>Nail technicians, lash artists, and beauty pros</li>
        <li>Therapists, counselors, and mental health practitioners</li>
        <li>Massage therapists and bodyworkers</li>
        <li>Acupuncturists and energy healers</li>
        <li>Med spa and aesthetic clinic owners</li>
        <li>Fertility and IVF consultants</li>
        <li>Tattoo artists and body piercers</li>
        <li>Fitness and wellness coaches</li>
        <li>Creative freelancers of all kinds</li>
      </ul>
      <p>
        If your work is personal — if you&apos;d rather your clients feel
        pampered than processed — Bloom is for you.
      </p>

      <h2>What we believe</h2>
      <h3>Beauty matters</h3>
      <p>
        The difference between a tool your clients tolerate and a tool they
        love is the difference between &quot;okay&quot; and &quot;wow.&quot; We chase the wow.
      </p>

      <h3>Simplicity is kindness</h3>
      <p>
        You shouldn&apos;t need a training video to run your business. Bloom&apos;s
        interface is designed so a stylist who &quot;isn&apos;t great with
        computers&quot; can set up her whole booking page in 5 minutes.
      </p>

      <h3>Your data is yours</h3>
      <p>
        Export anything, any time. Delete your account and we delete your
        data. We will never sell your client information. We will never
        train AI on your bookings. These aren&apos;t features — they&apos;re baseline
        respect.
      </p>

      <h3>Fair pricing</h3>
      <p>
        Our Free plan is actually free. Paid plans are priced for real
        people running real businesses, not for VC-funded scale.{" "}
        <Link href="/#pricing">See pricing</Link>.
      </p>

      <h2>The brand</h2>
      <p>
        Bloom is named after the moment of becoming. A flower blooms. A
        relationship blooms. A client walks out of your studio blooming. A
        rendez-vous is a French word for an appointment — and it&apos;s the only
        French word English speakers use without feeling silly. We think
        that&apos;s the right mix: premium without pretension.
      </p>

      <h2>Where we are</h2>
      <p>
        Bloom is small and early. We&apos;re building carefully, shipping often,
        and listening to every piece of feedback from our first providers.
        If you&apos;d like to be part of the early crew, join us with the{" "}
        <Link href="/signup">Free plan</Link> or{" "}
        <a href="mailto:hello@bloomrdv.com">send us a note</a>.
      </p>

      <h2>Get in touch</h2>
      <p>
        Questions? Press? Feedback? Feature requests? We want to hear all of
        them. Email <a href="mailto:hello@bloomrdv.com">hello@bloomrdv.com</a>{" "}
        — we read and reply to everything.
      </p>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-sm text-pink-600 hover:underline">
          ← Back to Bloom
        </Link>
      </div>
    </MarketingShell>
  );
}
