// ─────────────────────────────────────────────────────────────
//  Preview examples for the marketing template showcase
//
//  Each template gets a list of fake businesses across different
//  industries. The marketing landing page rotates through them so
//  visitors see that one template can serve many kinds of providers.
// ─────────────────────────────────────────────────────────────

import type { TemplateId } from "./index";

export interface PreviewExample {
  business: string;
  services: Array<{
    emoji: string;
    name: string;
    price: number;
  }>;
}

export const PREVIEW_EXAMPLES: Record<TemplateId, PreviewExample[]> = {
  // Aura — dreamlike, ethereal (therapy, wellness, IVF, acupuncture)
  aura: [
    {
      business: "Stillpoint Therapy",
      services: [
        { emoji: "🌙", name: "Couples session", price: 220 },
        { emoji: "✨", name: "Individual therapy", price: 180 },
        { emoji: "🌿", name: "Mindfulness intake", price: 90 },
      ],
    },
    {
      business: "Hearth IVF Concierge",
      services: [
        { emoji: "💞", name: "Fertility consult", price: 280 },
        { emoji: "🩺", name: "Cycle planning", price: 350 },
        { emoji: "📋", name: "Genetic counseling", price: 200 },
      ],
    },
    {
      business: "Wildroot Acupuncture",
      services: [
        { emoji: "🪷", name: "Full body session", price: 145 },
        { emoji: "🌸", name: "Cupping add-on", price: 65 },
        { emoji: "🍃", name: "Herbal consult", price: 95 },
      ],
    },
    {
      business: "Moonlit Energy Healing",
      services: [
        { emoji: "🔮", name: "Reiki session", price: 130 },
        { emoji: "🕊️", name: "Sound bath", price: 85 },
        { emoji: "✨", name: "Chakra alignment", price: 110 },
      ],
    },
  ],

  // Rose — warm, lush, feminine (nails, beauty, lash, brides)
  bloom: [
    {
      business: "Petal & Polish",
      services: [
        { emoji: "💅", name: "Gel manicure", price: 65 },
        { emoji: "🌺", name: "Spa pedicure", price: 80 },
        { emoji: "✨", name: "Nail art design", price: 45 },
      ],
    },
    {
      business: "Lash by Lila",
      services: [
        { emoji: "👁️", name: "Classic lash set", price: 145 },
        { emoji: "🦋", name: "Volume fills", price: 95 },
        { emoji: "💫", name: "Lash lift & tint", price: 110 },
      ],
    },
    {
      business: "Brow Bar at Maple",
      services: [
        { emoji: "🌷", name: "Brow lamination", price: 85 },
        { emoji: "🪞", name: "Tint & shape", price: 55 },
        { emoji: "💖", name: "Microblading", price: 450 },
      ],
    },
    {
      business: "The Bridal Atelier",
      services: [
        { emoji: "👰", name: "Bridal trial", price: 180 },
        { emoji: "💐", name: "Wedding day glam", price: 350 },
        { emoji: "💍", name: "Bridesmaid party", price: 120 },
      ],
    },
  ],

  // Edge — bold, dark, electric (barbers, tattoo, fitness, edgy hair)
  edge: [
    {
      business: "Iron Owl Barbershop",
      services: [
        { emoji: "✂️", name: "Skin fade", price: 45 },
        { emoji: "🪒", name: "Hot towel shave", price: 55 },
        { emoji: "🧔", name: "Beard sculpt", price: 35 },
      ],
    },
    {
      business: "Black Lotus Tattoo",
      services: [
        { emoji: "🖋️", name: "Custom design consult", price: 75 },
        { emoji: "⚡", name: "Half-day session", price: 600 },
        { emoji: "🌹", name: "Touch-up", price: 120 },
      ],
    },
    {
      business: "Forge Performance Coaching",
      services: [
        { emoji: "💪", name: "1-on-1 strength", price: 95 },
        { emoji: "🏋️", name: "Programming review", price: 150 },
        { emoji: "🔥", name: "Movement assessment", price: 80 },
      ],
    },
    {
      business: "Volt Studio · Hair",
      services: [
        { emoji: "⚡", name: "Vivid color", price: 320 },
        { emoji: "✂️", name: "Razor cut", price: 95 },
        { emoji: "🎨", name: "Color correction", price: 450 },
      ],
    },
  ],

  // Luxe — black + gold, dramatic (med spa, derm, luxury hair, IVF concierge)
  luxe: [
    {
      business: "Maison Dermatologie",
      services: [
        { emoji: "✨", name: "Botox consultation", price: 300 },
        { emoji: "💎", name: "HydraFacial deluxe", price: 450 },
        { emoji: "🔬", name: "Laser resurfacing", price: 850 },
      ],
    },
    {
      business: "Atelier 24 · Hair",
      services: [
        { emoji: "👑", name: "Master colorist", price: 550 },
        { emoji: "✂️", name: "Signature cut", price: 280 },
        { emoji: "💫", name: "Keratin treatment", price: 420 },
      ],
    },
    {
      business: "Dorée IVF Concierge",
      services: [
        { emoji: "🥂", name: "Private consultation", price: 480 },
        { emoji: "📋", name: "Personalized protocol", price: 950 },
        { emoji: "🩺", name: "Cycle monitoring", price: 350 },
      ],
    },
    {
      business: "Velluto Med Spa",
      services: [
        { emoji: "💉", name: "Filler signature", price: 720 },
        { emoji: "🌟", name: "Microneedling", price: 380 },
        { emoji: "💫", name: "PRP facial", price: 650 },
      ],
    },
  ],

  // Pop — bright, playful (kids hair, party planners, kids therapy, family photo)
  pop: [
    {
      business: "Snip & Sprinkle Kids",
      services: [
        { emoji: "✂️", name: "First haircut", price: 35 },
        { emoji: "🌈", name: "Rainbow braid", price: 25 },
        { emoji: "🦄", name: "Birthday glam", price: 50 },
      ],
    },
    {
      business: "Sparkle Party Co.",
      services: [
        { emoji: "🎉", name: "Birthday consult", price: 75 },
        { emoji: "🎈", name: "Theme planning", price: 200 },
        { emoji: "🎂", name: "Full party setup", price: 850 },
      ],
    },
    {
      business: "Bright Spot Kids Therapy",
      services: [
        { emoji: "🧸", name: "Play therapy", price: 145 },
        { emoji: "🎨", name: "Art therapy", price: 130 },
        { emoji: "👨‍👩‍👧", name: "Family session", price: 180 },
      ],
    },
    {
      business: "Sunbeam Family Photo",
      services: [
        { emoji: "📸", name: "Mini session", price: 195 },
        { emoji: "🌻", name: "Outdoor family", price: 380 },
        { emoji: "👶", name: "Newborn shoot", price: 450 },
      ],
    },
  ],

  // Studio — crisp, modern (physio, dental, derm, fertility, mental health)
  studio: [
    {
      business: "Pivot Physiotherapy",
      services: [
        { emoji: "🦴", name: "Initial assessment", price: 145 },
        { emoji: "🧘", name: "Treatment session", price: 95 },
        { emoji: "🏃", name: "Sports rehab", price: 110 },
      ],
    },
    {
      business: "Northbridge Dental",
      services: [
        { emoji: "🦷", name: "Cleaning & exam", price: 180 },
        { emoji: "✨", name: "Whitening", price: 350 },
        { emoji: "🪥", name: "Hygiene visit", price: 120 },
      ],
    },
    {
      business: "Clearwater Fertility",
      services: [
        { emoji: "🩺", name: "Initial consult", price: 250 },
        { emoji: "📊", name: "Cycle review", price: 180 },
        { emoji: "💊", name: "Medication planning", price: 200 },
      ],
    },
    {
      business: "Quiet Mind Counseling",
      services: [
        { emoji: "🧠", name: "Therapy session", price: 165 },
        { emoji: "💬", name: "Couples intake", price: 220 },
        { emoji: "📋", name: "Assessment", price: 280 },
      ],
    },
  ],
};
