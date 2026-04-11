import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MarketingFooter } from "./footer";

/**
 * Shared shell for the trust pages (privacy, terms, security, about, contact).
 * Renders the same nav as the landing (so the wordmark is consistent) plus
 * the shared footer. Content area is a narrow prose column with generous
 * top padding so the hero title of each page has room to breathe.
 */
export function MarketingShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between max-w-6xl w-full mx-auto px-6 py-6">
        <Link
          href="/"
          className="flex flex-col items-start sm:flex-row sm:items-baseline sm:gap-2 leading-none group"
        >
          <span className="text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            Bloom
          </span>
          <span className="font-script text-2xl text-gray-900 -mt-1 sm:mt-0 sm:-translate-y-0.5">
            rendez-vous
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/#pricing"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
          >
            Pricing
          </Link>
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

      {/* Hero title */}
      <div className="max-w-3xl w-full mx-auto px-6 pt-8 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        {subtitle && (
          <p className="text-lg text-gray-500 mt-5 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content — narrow reading column.
          Child pages use semantic tags (h2, h3, p, ul, li, a) and get
          consistent styling via the bloom-prose class defined in globals.css. */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pb-24">
        <div className="bloom-prose">{children}</div>
      </main>

      <MarketingFooter />
    </div>
  );
}
