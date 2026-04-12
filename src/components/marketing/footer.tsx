import Link from "next/link";
import { Mail, Shield } from "lucide-react";

/**
 * Shared footer for the marketing landing + all trust pages.
 * Contains brand wordmark, legal/trust links, contact email,
 * and a small "Secured by Stripe" badge row.
 */
export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-baseline gap-2 leading-none group"
            >
              <span className="text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                Bloom
              </span>
              <span className="font-script text-xl text-gray-900">
                rendez-vous
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              Booking, beautifully. For hair stylists, beauty pros,
              therapists, and every kind of service provider who deserves
              a better page.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600">
                <Shield className="h-3 w-3 text-green-600" />
                Secured by Stripe
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600">
                🔒 PCI-DSS Level 1
              </div>
            </div>
          </div>

          {/* Product column */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Product
            </div>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/#pricing" className="hover:text-pink-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-pink-600 transition-colors">
                  Get started free
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-pink-600 transition-colors">
                  Log in
                </Link>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Company
            </div>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/about" className="hover:text-pink-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-pink-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-pink-600 transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-pink-600 transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-pink-600 transition-colors">
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Client note — for confused Googlers who landed here instead of
            on their provider's page. Bloom's primary marketing audience is
            providers; clients discover Bloom via a specific booking page. */}
        <div className="mt-10 pt-6 border-t border-pink-100">
          <div className="rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border border-pink-100 px-5 py-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold text-pink-700">Looking to book an appointment?</span>{" "}
              Bloom is the platform your stylist, therapist, or beauty pro
              uses to run their booking page. To book with a specific provider,
              open the link they shared with you (usually on Instagram, a
              business card, or an appointment reminder email). You&apos;ll be
              able to create an account right from their page.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Bloom · Rendez-vous. Made with care
            for the beauty &amp; wellness community.
          </p>
          <a
            href="mailto:hello@bloomrdv.com"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-pink-600 transition-colors"
          >
            <Mail className="h-3 w-3" />
            hello@bloomrdv.com
          </a>
        </div>
      </div>
    </footer>
  );
}
