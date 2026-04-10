import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { allFontVariables } from "@/lib/templates/fonts";
import { InstallPwaPrompt } from "@/components/install-pwa-prompt";
import "./globals.css";

// Plus Jakarta Sans — premium, modern body font for the dashboard
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-dashboard-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Fraunces — elegant serif for dashboard headings (gives the premium magazine feel)
const fraunces = Fraunces({
  variable: "--font-dashboard-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scheduler — Beautiful Booking Made Simple",
  description:
    "The scheduling platform designed for hair stylists and therapists. Set up your services, share your link, and let clients book and pay.",
  applicationName: "Scheduler",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Scheduler",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#a855f7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable} ${geistMono.variable} ${allFontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <InstallPwaPrompt />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
