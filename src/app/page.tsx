import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Clock, CreditCard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Nav */}
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
        <div className="text-2xl font-bold tracking-tight">
          <span className="text-purple-600">Scheduler</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants())}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          Beautiful booking
          <br />
          <span className="text-purple-600">made simple</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
          The scheduling platform designed for hair stylists and therapists.
          Set up your services, share your link, and let clients book and pay
          — all in one place.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Start for Free
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            I have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg">Your Brand, Your Way</h3>
            <p className="text-sm text-muted-foreground">
              Customize colors, logo, and theme to match your business perfectly
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="font-semibold text-lg">Calendar Sync</h3>
            <p className="text-sm text-muted-foreground">
              Google, Outlook, Apple, and Proton — your availability stays
              accurate everywhere
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
              <CreditCard className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-lg">Get Paid Instantly</h3>
            <p className="text-sm text-muted-foreground">
              Stripe-powered payments with deposits. Money goes straight to your
              account
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-lg">Reminders Built In</h3>
            <p className="text-sm text-muted-foreground">
              SMS, WhatsApp, and email — so clients never miss their appointment
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-muted-foreground">
        <p>Made with care for the beauty and wellness community</p>
      </footer>
    </div>
  );
}
