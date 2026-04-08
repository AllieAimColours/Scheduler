// ─────────────────────────────────────────────────────────────
//  Booking-page templates — single source of truth
//  Each template fully transforms the public booking experience.
// ─────────────────────────────────────────────────────────────

export type TemplateId = "aura" | "bloom" | "edge" | "luxe" | "pop" | "studio";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  tagline: string;
  audience: string;
  fonts: { heading: string; body: string };
  cssVars: Record<string, string>;
  classes: {
    page: string;
    card: string;
    cardHover: string;
    button: string;
    buttonOutline: string;
    heading: string;
    body: string;
    badge: string;
    input: string;
    timeSlot: string;
    timeSlotActive: string;
    accentBar: string;
    summaryBox: string;
  };
  animations: {
    cardEnter: string;
    buttonHover: string;
    pageEnter: string;
  };
  decorations: {
    background: string;
    hasOrbs: boolean;
    hasGrid: boolean;
    hasConfetti: boolean;
    hasShimmer: boolean;
  };
}

// ─────────────────────────────────────────────────────────────
//  1. AURA — ethereal, calm (therapists, spa, wellness)
// ─────────────────────────────────────────────────────────────
const aura: TemplateDefinition = {
  id: "aura",
  name: "Aura",
  tagline: "Calm, ethereal energy",
  audience: "Therapists, spas, wellness practitioners",
  fonts: { heading: "Cormorant Garamond", body: "Inter" },
  cssVars: {
    "--background": "#FFF8F0",
    "--foreground": "#4A3560",
    "--card": "rgba(255, 255, 255, 0.55)",
    "--card-foreground": "#4A3560",
    "--primary": "#9B7EC8",
    "--primary-foreground": "#FFFFFF",
    "--secondary": "#D4E5D2",
    "--secondary-foreground": "#3A5438",
    "--muted": "#F0EAF5",
    "--muted-foreground": "#7A6B8A",
    "--accent": "#E8C4C4",
    "--accent-foreground": "#6B3A3A",
    "--border": "rgba(155, 126, 200, 0.20)",
    "--input": "rgba(155, 126, 200, 0.15)",
    "--ring": "#9B7EC8",
    "--radius": "1.5rem",
    "--template-accent": "#9B7EC8",
    "--template-glow": "rgba(155, 126, 200, 0.35)",
    "--template-surface": "rgba(255, 255, 255, 0.45)",
  },
  classes: {
    page: "min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F0EAF5] to-[#E8E0F0] font-[Inter] text-[#4A3560] relative overflow-hidden",
    card: "backdrop-blur-xl bg-white/55 border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(155,126,200,0.12)] p-6 transition-all duration-500 ease-out",
    cardHover: "hover:shadow-[0_16px_48px_rgba(155,126,200,0.22)] hover:-translate-y-1 hover:bg-white/65",
    button: "bg-gradient-to-r from-[#9B7EC8] to-[#B89AD8] text-white rounded-full px-8 py-3 font-medium tracking-wide shadow-[0_4px_20px_rgba(155,126,200,0.35)] transition-all duration-300",
    buttonOutline: "border border-[#9B7EC8]/30 text-[#9B7EC8] rounded-full px-8 py-3 font-medium bg-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-[#9B7EC8]/10",
    heading: "font-[Cormorant_Garamond] font-semibold tracking-tight text-[#4A3560] leading-tight",
    body: "font-[Inter] font-light text-[#7A6B8A] leading-relaxed tracking-wide",
    badge: "bg-[#D4E5D2]/60 text-[#3A5438] text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-[#D4E5D2]/40",
    input: "bg-white/50 backdrop-blur-sm border border-[#9B7EC8]/20 rounded-2xl px-4 py-3 text-[#4A3560] placeholder:text-[#9B7EC8]/40 focus:outline-none focus:ring-2 focus:ring-[#9B7EC8]/30 focus:border-transparent transition-all duration-300",
    timeSlot: "bg-white/40 backdrop-blur-sm border border-[#9B7EC8]/15 rounded-2xl px-4 py-3 text-sm text-[#4A3560] cursor-pointer transition-all duration-300 hover:bg-[#9B7EC8]/10 hover:border-[#9B7EC8]/30",
    timeSlotActive: "bg-gradient-to-r from-[#9B7EC8] to-[#B89AD8] text-white border-transparent rounded-2xl px-4 py-3 text-sm shadow-[0_4px_16px_rgba(155,126,200,0.35)] cursor-pointer",
    accentBar: "h-1 w-16 rounded-full bg-gradient-to-r from-[#9B7EC8] to-[#D4E5D2]",
    summaryBox: "bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-[0_4px_24px_rgba(155,126,200,0.10)]",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out",
    buttonHover: "hover:shadow-[0_8px_28px_rgba(155,126,200,0.45)] hover:scale-[1.02] active:scale-[0.98]",
    pageEnter: "animate-in fade-in-0 duration-1000 ease-out",
  },
  decorations: {
    background: "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(155,126,200,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(212,229,210,0.15) 0%, transparent 60%)",
    hasOrbs: true,
    hasGrid: false,
    hasConfetti: false,
    hasShimmer: false,
  },
};

// ─────────────────────────────────────────────────────────────
//  2. BLOOM — warm, feminine (hair stylists, beauty, nails)
// ─────────────────────────────────────────────────────────────
const bloom: TemplateDefinition = {
  id: "bloom",
  name: "Bloom",
  tagline: "Warm, feminine radiance",
  audience: "Hair stylists, beauty pros, nail artists",
  fonts: { heading: "Playfair Display", body: "DM Sans" },
  cssVars: {
    "--background": "#FFF9F5",
    "--foreground": "#8B4557",
    "--card": "#FFFFFF",
    "--card-foreground": "#8B4557",
    "--primary": "#D4A853",
    "--primary-foreground": "#FFFFFF",
    "--secondary": "#F9E4E4",
    "--secondary-foreground": "#8B4557",
    "--muted": "#FCEADE",
    "--muted-foreground": "#A06070",
    "--accent": "#D4A853",
    "--accent-foreground": "#FFFFFF",
    "--border": "#F0D6D6",
    "--input": "#FDF0ED",
    "--ring": "#D4A853",
    "--radius": "1rem",
    "--template-accent": "#D4A853",
    "--template-glow": "rgba(212, 168, 83, 0.25)",
    "--template-surface": "#FFFAF7",
  },
  classes: {
    page: "min-h-screen bg-gradient-to-b from-[#FFF9F5] via-[#FCEADE] to-[#F9E4E4] font-[DM_Sans] text-[#8B4557] relative overflow-hidden",
    card: "bg-white rounded-2xl border border-[#F0D6D6] shadow-[0_4px_24px_rgba(212,168,83,0.08),0_1px_3px_rgba(139,69,87,0.06)] p-6 transition-all duration-400 ease-out relative before:absolute before:inset-0 before:rounded-2xl before:p-px before:bg-gradient-to-br before:from-[#D4A853]/20 before:to-[#F9E4E4]/20 before:-z-10",
    cardHover: "hover:shadow-[0_12px_40px_rgba(212,168,83,0.15),0_2px_6px_rgba(139,69,87,0.08)] hover:-translate-y-0.5",
    button: "bg-gradient-to-r from-[#D4A853] to-[#E0BE7A] text-white rounded-xl px-8 py-3 font-semibold shadow-[0_2px_12px_rgba(212,168,83,0.30)] transition-all duration-300",
    buttonOutline: "border-2 border-[#D4A853]/40 text-[#D4A853] rounded-xl px-8 py-3 font-semibold bg-transparent transition-all duration-300 hover:bg-[#D4A853]/5 hover:border-[#D4A853]/60",
    heading: "font-[Playfair_Display] font-bold text-[#8B4557] tracking-normal italic leading-snug",
    body: "font-[DM_Sans] text-[#A06070] leading-relaxed",
    badge: "bg-[#F9E4E4] text-[#8B4557] text-xs font-semibold px-3 py-1 rounded-full border border-[#F0D6D6]",
    input: "bg-[#FFFAF7] border border-[#F0D6D6] rounded-xl px-4 py-3 text-[#8B4557] placeholder:text-[#D4A853]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/25 focus:border-[#D4A853]/50 transition-all duration-300",
    timeSlot: "bg-[#FFFAF7] border border-[#F0D6D6] rounded-xl px-4 py-3 text-sm text-[#8B4557] cursor-pointer transition-all duration-300 hover:border-[#D4A853]/40 hover:bg-[#FDF0ED]",
    timeSlotActive: "bg-gradient-to-r from-[#D4A853] to-[#E0BE7A] text-white border-transparent rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_4px_16px_rgba(212,168,83,0.30)] cursor-pointer",
    accentBar: "h-0.5 w-20 bg-gradient-to-r from-[#D4A853] via-[#E0BE7A] to-[#D4A853]",
    summaryBox: "bg-[#FFFAF7] border border-[#F0D6D6] rounded-2xl p-6 shadow-[0_2px_12px_rgba(212,168,83,0.06)]",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out",
    buttonHover: "hover:shadow-[0_6px_20px_rgba(212,168,83,0.40)] hover:-translate-y-0.5 active:translate-y-0",
    pageEnter: "animate-in fade-in-0 duration-700 ease-out",
  },
  decorations: {
    background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(252,234,222,0.5) 0%, transparent 70%)",
    hasOrbs: false,
    hasGrid: false,
    hasConfetti: false,
    hasShimmer: true,
  },
};

// ─────────────────────────────────────────────────────────────
//  3. EDGE — bold, dark, modern (barbers, tattoo, edgy stylists)
// ─────────────────────────────────────────────────────────────
const edge: TemplateDefinition = {
  id: "edge",
  name: "Edge",
  tagline: "Bold, dark, electric",
  audience: "Barbers, tattoo artists, edgy stylists",
  fonts: { heading: "Space Grotesk", body: "JetBrains Mono" },
  cssVars: {
    "--background": "#0D0D0D",
    "--foreground": "#F5F5F5",
    "--card": "#1A1A1A",
    "--card-foreground": "#F5F5F5",
    "--primary": "#00F0FF",
    "--primary-foreground": "#0D0D0D",
    "--secondary": "#1F1F1F",
    "--secondary-foreground": "#A0A0A0",
    "--muted": "#262626",
    "--muted-foreground": "#808080",
    "--accent": "#FF00E5",
    "--accent-foreground": "#FFFFFF",
    "--border": "#2A2A2A",
    "--input": "#1A1A1A",
    "--ring": "#00F0FF",
    "--radius": "0.375rem",
    "--template-accent": "#00F0FF",
    "--template-glow": "rgba(0, 240, 255, 0.25)",
    "--template-surface": "#141414",
  },
  classes: {
    page: "min-h-screen bg-[#0D0D0D] font-[JetBrains_Mono] text-[#F5F5F5] relative overflow-hidden",
    card: "bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-6 transition-all duration-300 ease-out shadow-[0_0_0_1px_rgba(0,240,255,0.05)]",
    cardHover: "hover:border-[#00F0FF]/30 hover:shadow-[0_0_24px_rgba(0,240,255,0.12),0_0_0_1px_rgba(0,240,255,0.15)]",
    button: "bg-[#00F0FF] text-[#0D0D0D] rounded-md px-8 py-3 font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(0,240,255,0.30)] transition-all duration-200",
    buttonOutline: "border border-[#00F0FF]/40 text-[#00F0FF] rounded-md px-8 py-3 font-bold uppercase tracking-widest text-sm bg-transparent transition-all duration-200 hover:bg-[#00F0FF]/10 hover:shadow-[0_0_16px_rgba(0,240,255,0.15)]",
    heading: "font-[Space_Grotesk] font-bold text-[#F5F5F5] uppercase tracking-[0.15em] leading-none",
    body: "font-[JetBrains_Mono] text-sm text-[#808080] leading-relaxed tracking-wide",
    badge: "bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded border border-[#00F0FF]/20",
    input: "bg-[#141414] border border-[#2A2A2A] rounded-md px-4 py-3 text-[#F5F5F5] font-mono text-sm placeholder:text-[#555555] focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 focus:border-[#00F0FF]/50 transition-all duration-200",
    timeSlot: "bg-[#141414] border border-[#2A2A2A] rounded-md px-4 py-3 text-sm font-mono text-[#A0A0A0] cursor-pointer transition-all duration-200 hover:border-[#00F0FF]/30 hover:text-[#00F0FF] hover:shadow-[0_0_12px_rgba(0,240,255,0.08)]",
    timeSlotActive: "bg-[#00F0FF] text-[#0D0D0D] border-transparent rounded-md px-4 py-3 text-sm font-mono font-bold shadow-[0_0_20px_rgba(0,240,255,0.35)] cursor-pointer",
    accentBar: "h-px w-full bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent",
    summaryBox: "bg-[#141414] border border-[#2A2A2A] rounded-md p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out",
    buttonHover: "hover:shadow-[0_0_32px_rgba(0,240,255,0.45)] hover:scale-[1.01] active:scale-[0.99]",
    pageEnter: "animate-in fade-in-0 duration-500 ease-out",
  },
  decorations: {
    background: "linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)",
    hasOrbs: false,
    hasGrid: true,
    hasConfetti: false,
    hasShimmer: false,
  },
};

// ─────────────────────────────────────────────────────────────
//  4. LUXE — minimal, premium (luxury salons, aesthetics)
// ─────────────────────────────────────────────────────────────
const luxe: TemplateDefinition = {
  id: "luxe",
  name: "Luxe",
  tagline: "Minimal, refined luxury",
  audience: "Luxury salons, premium aesthetics",
  fonts: { heading: "Bodoni Moda", body: "Outfit" },
  cssVars: {
    "--background": "#FAFAFA",
    "--foreground": "#1A1A1A",
    "--card": "#FFFFFF",
    "--card-foreground": "#1A1A1A",
    "--primary": "#1A1A1A",
    "--primary-foreground": "#FFFFFF",
    "--secondary": "#F0F0F0",
    "--secondary-foreground": "#2D2D2D",
    "--muted": "#F5F5F5",
    "--muted-foreground": "#888888",
    "--accent": "#C9A96E",
    "--accent-foreground": "#FFFFFF",
    "--border": "#E8E8E8",
    "--input": "#F5F5F5",
    "--ring": "#C9A96E",
    "--radius": "0.5rem",
    "--template-accent": "#C9A96E",
    "--template-glow": "rgba(201, 169, 110, 0.15)",
    "--template-surface": "#FAFAFA",
  },
  classes: {
    page: "min-h-screen bg-[#FAFAFA] font-[Outfit] text-[#1A1A1A] relative",
    card: "bg-white border border-[#E8E8E8] rounded-lg p-8 transition-all duration-500 ease-out shadow-none",
    cardHover: "hover:border-[#C9A96E]/40 hover:shadow-[0_2px_20px_rgba(0,0,0,0.04)]",
    button: "bg-[#1A1A1A] text-white rounded-lg px-10 py-3.5 font-medium tracking-[0.08em] uppercase text-sm transition-all duration-400",
    buttonOutline: "border border-[#1A1A1A] text-[#1A1A1A] rounded-lg px-10 py-3.5 font-medium tracking-[0.08em] uppercase text-sm bg-transparent transition-all duration-400 hover:bg-[#1A1A1A] hover:text-white",
    heading: "font-[Bodoni_Moda] font-normal text-[#1A1A1A] tracking-[0.04em] leading-tight",
    body: "font-[Outfit] font-light text-[#888888] leading-loose tracking-wide",
    badge: "bg-transparent text-[#C9A96E] text-xs font-medium uppercase tracking-[0.12em] px-3 py-1 border border-[#C9A96E]/30 rounded",
    input: "bg-[#FAFAFA] border border-[#E8E8E8] rounded-lg px-5 py-3.5 text-[#1A1A1A] placeholder:text-[#CCCCCC] focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]/40 transition-all duration-400",
    timeSlot: "bg-white border border-[#E8E8E8] rounded-lg px-5 py-3.5 text-sm text-[#2D2D2D] cursor-pointer transition-all duration-400 hover:border-[#C9A96E]/50",
    timeSlotActive: "bg-[#1A1A1A] text-white border-transparent rounded-lg px-5 py-3.5 text-sm font-medium tracking-wide cursor-pointer",
    accentBar: "h-px w-12 bg-[#C9A96E]",
    summaryBox: "bg-white border border-[#E8E8E8] rounded-lg p-8",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 duration-600 ease-out",
    buttonHover: "hover:bg-[#2D2D2D] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] active:scale-[0.99]",
    pageEnter: "animate-in fade-in-0 duration-800 ease-out",
  },
  decorations: {
    background: "none",
    hasOrbs: false,
    hasGrid: false,
    hasConfetti: false,
    hasShimmer: false,
  },
};

// ─────────────────────────────────────────────────────────────
//  5. POP — colorful, energetic (kids stylists, creative therapists)
// ─────────────────────────────────────────────────────────────
const pop: TemplateDefinition = {
  id: "pop",
  name: "Pop",
  tagline: "Bright, bold, playful",
  audience: "Kids stylists, creative therapists, fun brands",
  fonts: { heading: "Fredoka", body: "Nunito" },
  cssVars: {
    "--background": "#F5F0FF",
    "--foreground": "#2D1B69",
    "--card": "#FFFFFF",
    "--card-foreground": "#2D1B69",
    "--primary": "#7C3AED",
    "--primary-foreground": "#FFFFFF",
    "--secondary": "#FEF3C7",
    "--secondary-foreground": "#92400E",
    "--muted": "#EDE9FE",
    "--muted-foreground": "#6D5BA3",
    "--accent": "#EC4899",
    "--accent-foreground": "#FFFFFF",
    "--border": "#DDD6FE",
    "--input": "#F5F0FF",
    "--ring": "#7C3AED",
    "--radius": "1.5rem",
    "--template-accent": "#7C3AED",
    "--template-glow": "rgba(124, 58, 237, 0.25)",
    "--template-surface": "#FAF5FF",
  },
  classes: {
    page: "min-h-screen bg-gradient-to-br from-[#F5F0FF] via-[#FDF2F8] to-[#EFF6FF] font-[Nunito] text-[#2D1B69] relative overflow-hidden",
    card: "bg-white rounded-3xl border-2 border-[#DDD6FE] p-6 transition-all duration-300 ease-out shadow-[4px_4px_0_0_#DDD6FE]",
    cardHover: "hover:shadow-[6px_6px_0_0_#7C3AED] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-[#7C3AED]",
    button: "bg-[#7C3AED] text-white rounded-full px-8 py-3 font-bold text-base shadow-[3px_3px_0_0_#5B21B6] transition-all duration-200 border-2 border-[#5B21B6]",
    buttonOutline: "border-2 border-[#7C3AED] text-[#7C3AED] rounded-full px-8 py-3 font-bold text-base bg-white shadow-[3px_3px_0_0_#DDD6FE] transition-all duration-200 hover:bg-[#F5F0FF]",
    heading: "font-[Fredoka] font-semibold text-[#2D1B69] tracking-tight leading-snug",
    body: "font-[Nunito] font-medium text-[#6D5BA3] leading-relaxed",
    badge: "bg-[#FACC15] text-[#92400E] text-xs font-extrabold px-3 py-1 rounded-full border-2 border-[#EAB308] shadow-[2px_2px_0_0_#EAB308]",
    input: "bg-white border-2 border-[#DDD6FE] rounded-2xl px-4 py-3 text-[#2D1B69] placeholder:text-[#C4B5FD] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all duration-200",
    timeSlot: "bg-white border-2 border-[#DDD6FE] rounded-2xl px-4 py-3 text-sm font-semibold text-[#6D5BA3] cursor-pointer transition-all duration-200 hover:border-[#EC4899] hover:text-[#EC4899] hover:shadow-[3px_3px_0_0_#FBCFE8]",
    timeSlotActive: "bg-[#EC4899] text-white border-2 border-[#DB2777] rounded-2xl px-4 py-3 text-sm font-bold shadow-[3px_3px_0_0_#DB2777] cursor-pointer",
    accentBar: "h-1.5 w-20 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#FACC15]",
    summaryBox: "bg-[#FAF5FF] border-2 border-[#DDD6FE] rounded-3xl p-6 shadow-[4px_4px_0_0_#EDE9FE]",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-400 ease-out",
    buttonHover: "hover:shadow-[1px_1px_0_0_#5B21B6] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1",
    pageEnter: "animate-in fade-in-0 zoom-in-[0.98] duration-500 ease-out",
  },
  decorations: {
    background: "radial-gradient(circle at 15% 85%, rgba(124,58,237,0.08) 0%, transparent 40%), radial-gradient(circle at 85% 15%, rgba(236,72,153,0.08) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)",
    hasOrbs: false,
    hasGrid: false,
    hasConfetti: true,
    hasShimmer: false,
  },
};

// ─────────────────────────────────────────────────────────────
//  6. STUDIO — clean, professional (clinical, medical aesthetics)
// ─────────────────────────────────────────────────────────────
const studio: TemplateDefinition = {
  id: "studio",
  name: "Studio",
  tagline: "Clean, structured, professional",
  audience: "Clinical practices, medical aesthetics",
  fonts: { heading: "Plus Jakarta Sans", body: "Plus Jakarta Sans" },
  cssVars: {
    "--background": "#FFFFFF",
    "--foreground": "#0F172A",
    "--card": "#FFFFFF",
    "--card-foreground": "#0F172A",
    "--primary": "#0D9488",
    "--primary-foreground": "#FFFFFF",
    "--secondary": "#F1F5F9",
    "--secondary-foreground": "#475569",
    "--muted": "#F8FAFC",
    "--muted-foreground": "#94A3B8",
    "--accent": "#0D9488",
    "--accent-foreground": "#FFFFFF",
    "--border": "#E2E8F0",
    "--input": "#F8FAFC",
    "--ring": "#0D9488",
    "--radius": "0.75rem",
    "--template-accent": "#0D9488",
    "--template-glow": "rgba(13, 148, 136, 0.15)",
    "--template-surface": "#F8FAFC",
  },
  classes: {
    page: "min-h-screen bg-[#F8FAFC] font-[Plus_Jakarta_Sans] text-[#0F172A] relative",
    card: "bg-white border border-[#E2E8F0] rounded-xl p-6 transition-all duration-300 ease-out shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
    cardHover: "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-[#CBD5E1]",
    button: "bg-[#0D9488] text-white rounded-xl px-8 py-3 font-semibold text-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200",
    buttonOutline: "border border-[#E2E8F0] text-[#475569] rounded-xl px-8 py-3 font-semibold text-sm bg-white transition-all duration-200 hover:bg-[#F8FAFC] hover:border-[#CBD5E1]",
    heading: "font-[Plus_Jakarta_Sans] font-bold text-[#0F172A] tracking-tight leading-tight",
    body: "font-[Plus_Jakarta_Sans] text-[#64748B] leading-relaxed",
    badge: "bg-[#F0FDFA] text-[#0D9488] text-xs font-semibold px-2.5 py-0.5 rounded-md border border-[#CCFBF1]",
    input: "bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all duration-200",
    timeSlot: "bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#475569] cursor-pointer transition-all duration-200 hover:border-[#0D9488]/40 hover:bg-[#F0FDFA]",
    timeSlotActive: "bg-[#0D9488] text-white border-transparent rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_1px_4px_rgba(13,148,136,0.25)] cursor-pointer",
    accentBar: "h-0.5 w-12 rounded-full bg-[#0D9488]",
    summaryBox: "bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out",
    buttonHover: "hover:bg-[#0F766E] hover:shadow-[0_2px_8px_rgba(13,148,136,0.20)] active:scale-[0.99]",
    pageEnter: "animate-in fade-in-0 duration-400 ease-out",
  },
  decorations: {
    background: "none",
    hasOrbs: false,
    hasGrid: false,
    hasConfetti: false,
    hasShimmer: false,
  },
};

// ─────────────────────────────────────────────────────────────
//  Registry & helpers
// ─────────────────────────────────────────────────────────────

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  aura,
  bloom,
  edge,
  luxe,
  pop,
  studio,
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

const DEFAULT_TEMPLATE: TemplateId = "studio";

/**
 * Get a template definition by id.
 * Returns the "studio" template if the id is missing or invalid.
 */
export function getTemplate(
  id: TemplateId | string | undefined,
): TemplateDefinition {
  if (id && id in TEMPLATES) {
    return TEMPLATES[id as TemplateId];
  }
  return TEMPLATES[DEFAULT_TEMPLATE];
}

/**
 * Extract the template id from a branding JSON object.
 * Looks for `branding.template`, falling back to "studio".
 */
export function getTemplateId(
  branding: Record<string, any> | null,
): TemplateId {
  const raw = branding?.template;
  if (typeof raw === "string" && raw in TEMPLATES) {
    return raw as TemplateId;
  }
  return DEFAULT_TEMPLATE;
}
