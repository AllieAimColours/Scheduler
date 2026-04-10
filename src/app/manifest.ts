import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bloom — Booking, Beautifully",
    short_name: "Bloom",
    description:
      "Bloom · rendez-vous — the booking platform designed for stylists, therapists, and creative service providers.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#a855f7",
    categories: ["business", "productivity", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Today's bookings",
        short_name: "Today",
        description: "See today's appointments",
        url: "/dashboard",
      },
      {
        name: "Your Page",
        short_name: "Page",
        description: "Customize your booking page",
        url: "/your-page",
      },
    ],
  };
}
