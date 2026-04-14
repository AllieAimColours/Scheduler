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
//  1. AURA — ethereal, dreamlike (therapists, spa, wellness)
// ─────────────────────────────────────────────────────────────
const aura: TemplateDefinition = {
  id: "aura",
  name: "Aura",
  tagline: "Dreamlike, ethereal magic",
  audience: "Therapy, IVF clinics, acupuncture, energy healing, wellness retreats",
  fonts: { heading: "Cormorant Garamond", body: "Inter" },
  cssVars: {
    "--background": "#1A0F2E",
    "--foreground": "#F5E9FF",
    "--card": "rgba(255, 255, 255, 0.06)",
    "--card-foreground": "#F5E9FF",
    "--primary": "#C4A0FF",
    "--primary-foreground": "#1A0F2E",
    "--secondary": "rgba(196, 160, 255, 0.15)",
    "--secondary-foreground": "#F5E9FF",
    "--muted": "rgba(255, 255, 255, 0.05)",
    "--muted-foreground": "#B8A8D4",
    "--accent": "#FF9ECF",
    "--accent-foreground": "#1A0F2E",
    "--border": "rgba(196, 160, 255, 0.20)",
    "--input": "rgba(255, 255, 255, 0.06)",
    "--ring": "#C4A0FF",
    "--radius": "1.75rem",
    "--template-accent": "#C4A0FF",
    "--template-glow": "rgba(196, 160, 255, 0.55)",
    "--template-surface": "rgba(255, 255, 255, 0.04)",
  },
  classes: {
    page: "min-h-screen bg-gradient-to-br from-[#0F0820] via-[#1A0F2E] to-[#2D1B4E] font-[Inter] text-[#F5E9FF] relative overflow-hidden",
    card: "backdrop-blur-2xl bg-white/[0.06] border border-white/15 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(196,160,255,0.35),inset_0_1px_0_0_rgba(255,255,255,0.15)] p-7 transition-all duration-700 ease-out relative",
    cardHover: "hover:shadow-[0_30px_80px_-15px_rgba(196,160,255,0.55),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:-translate-y-1.5 hover:bg-white/[0.09] hover:border-[#C4A0FF]/40",
    button: "bg-gradient-to-r from-[#C4A0FF] via-[#D4A8FF] to-[#FF9ECF] text-[#1A0F2E] rounded-full px-10 py-4 font-semibold tracking-wide shadow-[0_10px_40px_-5px_rgba(196,160,255,0.6)] transition-all duration-500",
    buttonOutline: "border-2 border-[#C4A0FF]/50 text-[#C4A0FF] rounded-full px-10 py-4 font-semibold backdrop-blur-xl bg-white/[0.04] transition-all duration-500 hover:bg-[#C4A0FF]/15 hover:border-[#C4A0FF]",
    heading: "font-[Cormorant_Garamond] font-semibold tracking-[-0.02em] text-[#F5E9FF] leading-[1.02] [text-shadow:0_0_30px_rgba(196,160,255,0.35)]",
    body: "font-[Inter] font-light text-[#B8A8D4] leading-[1.7] tracking-wide",
    badge: "bg-gradient-to-r from-[#C4A0FF]/20 to-[#FF9ECF]/20 text-[#F5E9FF] text-xs font-medium px-3 py-1 rounded-full backdrop-blur-md border border-white/20",
    input: "bg-white/[0.06] backdrop-blur-md border border-[#C4A0FF]/25 rounded-2xl px-5 py-3.5 text-[#F5E9FF] placeholder:text-[#B8A8D4]/50 focus:outline-none focus:ring-2 focus:ring-[#C4A0FF]/40 focus:border-[#C4A0FF]/60 transition-all duration-300",
    timeSlot: "bg-white/[0.05] backdrop-blur-md border border-[#C4A0FF]/20 rounded-2xl px-4 py-3.5 text-sm text-[#F5E9FF] cursor-pointer transition-all duration-400 hover:bg-[#C4A0FF]/15 hover:border-[#C4A0FF]/50 hover:shadow-[0_4px_20px_rgba(196,160,255,0.35)]",
    timeSlotActive: "bg-gradient-to-r from-[#C4A0FF] to-[#FF9ECF] text-[#1A0F2E] border-transparent rounded-2xl px-4 py-3.5 text-sm font-bold shadow-[0_8px_28px_rgba(196,160,255,0.55)] cursor-pointer",
    accentBar: "h-1 w-24 rounded-full bg-gradient-to-r from-[#C4A0FF] via-[#FF9ECF] to-[#C4A0FF] shadow-[0_2px_12px_rgba(196,160,255,0.5)]",
    summaryBox: "bg-white/[0.06] backdrop-blur-2xl border border-white/15 rounded-[2rem] p-8 shadow-[0_20px_60px_-15px_rgba(196,160,255,0.30)]",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 slide-in-from-bottom-6 duration-1000 ease-out",
    buttonHover: "hover:shadow-[0_15px_50px_-5px_rgba(196,160,255,0.75)] hover:scale-[1.03] active:scale-[0.98]",
    pageEnter: "animate-in fade-in-0 duration-1200 ease-out",
  },
  decorations: {
    background: "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(196,160,255,0.30) 0%, transparent 55%), radial-gradient(ellipse 70% 80% at 85% 90%, rgba(255,158,207,0.20) 0%, transparent 55%), radial-gradient(circle at 50% 50%, rgba(124,58,237,0.10) 0%, transparent 70%)",
    hasOrbs: true,
    hasGrid: false,
    hasConfetti: false,
    hasShimmer: true,
  },
};

// ─────────────────────────────────────────────────────────────
//  2. ROSE — warm, feminine, lush (hair stylists, beauty, nails)
//  Note: internal id stays "bloom" for data compatibility with
//  providers who already picked it. Display name only changed.
// ─────────────────────────────────────────────────────────────
const bloom: TemplateDefinition = {
  id: "bloom",
  name: "Rose",
  tagline: "Warm, lush, feminine power",
  audience: "Nail salons, beauty pros, lash & brow studios, brides",
  fonts: { heading: "Playfair Display", body: "DM Sans" },
  cssVars: {
    "--background": "#FFF1EC",
    "--foreground": "#5C1F2E",
    "--card": "#FFFFFF",
    "--card-foreground": "#5C1F2E",
    "--primary": "#D4348B",
    "--primary-foreground": "#FFFFFF",
    "--secondary": "#FFD6CC",
    "--secondary-foreground": "#5C1F2E",
    "--muted": "#FFE4DD",
    "--muted-foreground": "#A85577",
    "--accent": "#FF6B9D",
    "--accent-foreground": "#FFFFFF",
    "--border": "#FFCCDD",
    "--input": "#FFF6F2",
    "--ring": "#D4348B",
    "--radius": "1.5rem",
    "--template-accent": "#D4348B",
    "--template-glow": "rgba(212, 52, 139, 0.40)",
    "--template-surface": "#FFFAF7",
  },
  classes: {
    page: "min-h-screen bg-gradient-to-br from-[#FFE4DD] via-[#FFD6CC] to-[#FFC1D6] font-[DM_Sans] text-[#5C1F2E] relative overflow-hidden",
    card: "bg-white/95 backdrop-blur-md rounded-[1.75rem] border border-[#FFCCDD] shadow-[0_15px_50px_-10px_rgba(212,52,139,0.25),0_2px_8px_rgba(92,31,46,0.08)] p-7 transition-all duration-500 ease-out relative",
    cardHover: "hover:shadow-[0_25px_70px_-10px_rgba(212,52,139,0.40),0_4px_12px_rgba(92,31,46,0.12)] hover:-translate-y-1.5 hover:bg-white",
    button: "bg-gradient-to-r from-[#D4348B] via-[#FF6B9D] to-[#FF8AAB] text-white rounded-full px-10 py-4 font-bold tracking-wide shadow-[0_10px_30px_-5px_rgba(212,52,139,0.50)] transition-all duration-400",
    buttonOutline: "border-2 border-[#D4348B] text-[#D4348B] rounded-full px-10 py-4 font-bold bg-white/80 backdrop-blur-sm transition-all duration-400 hover:bg-[#D4348B]/10",
    heading: "font-[Playfair_Display] font-black text-[#5C1F2E] tracking-[-0.015em] leading-[1.08] [text-shadow:0_2px_20px_rgba(212,52,139,0.15)]",
    body: "font-[DM_Sans] text-[#A85577] leading-[1.65] tracking-[0.01em]",
    badge: "bg-gradient-to-r from-[#FFD6CC] to-[#FFC1D6] text-[#5C1F2E] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#FFCCDD] shadow-sm",
    input: "bg-[#FFF6F2] border-2 border-[#FFCCDD] rounded-2xl px-5 py-3.5 text-[#5C1F2E] placeholder:text-[#D4348B]/40 focus:outline-none focus:ring-2 focus:ring-[#D4348B]/30 focus:border-[#D4348B] transition-all duration-300",
    timeSlot: "bg-white border-2 border-[#FFCCDD] rounded-2xl px-4 py-3.5 text-sm font-medium text-[#5C1F2E] cursor-pointer transition-all duration-300 hover:border-[#D4348B] hover:bg-[#FFF1EC] hover:shadow-[0_4px_16px_rgba(212,52,139,0.20)]",
    timeSlotActive: "bg-gradient-to-r from-[#D4348B] to-[#FF6B9D] text-white border-transparent rounded-2xl px-4 py-3.5 text-sm font-bold shadow-[0_8px_24px_rgba(212,52,139,0.45)] cursor-pointer",
    accentBar: "h-1.5 w-28 rounded-full bg-gradient-to-r from-[#D4348B] via-[#FF6B9D] to-[#FFB8D6] shadow-[0_2px_12px_rgba(212,52,139,0.40)]",
    summaryBox: "bg-white/95 backdrop-blur-md border border-[#FFCCDD] rounded-[1.75rem] p-8 shadow-[0_15px_50px_-10px_rgba(212,52,139,0.25)]",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out",
    buttonHover: "hover:shadow-[0_15px_45px_-5px_rgba(212,52,139,0.65)] hover:-translate-y-1 active:translate-y-0",
    pageEnter: "animate-in fade-in-0 duration-900 ease-out",
  },
  decorations: {
    background: "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(212,52,139,0.20) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 80% 90%, rgba(255,107,157,0.18) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(255,193,214,0.15) 0%, transparent 70%)",
    hasOrbs: true,
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
  audience: "Barbers, tattoo studios, fitness coaches, edgy hair stylists",
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
    heading: "font-[Space_Grotesk] font-bold text-[#F5F5F5] uppercase tracking-[0.15em] leading-none [text-shadow:0_0_24px_rgba(0,240,255,0.25),0_0_48px_rgba(0,240,255,0.12)]",
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
//  4. LUXE — black, gold, dramatic (luxury salons, aesthetics)
// ─────────────────────────────────────────────────────────────
const luxe: TemplateDefinition = {
  id: "luxe",
  name: "Luxe",
  tagline: "Black tie, gilded, dramatic",
  audience: "Med spas, dermatology, luxury hair, premium aesthetics, IVF concierge",
  fonts: { heading: "Bodoni Moda", body: "Outfit" },
  cssVars: {
    "--background": "#0A0A0A",
    "--foreground": "#F5EFE0",
    "--card": "#141414",
    "--card-foreground": "#F5EFE0",
    "--primary": "#D4AF37",
    "--primary-foreground": "#0A0A0A",
    "--secondary": "#1F1F1F",
    "--secondary-foreground": "#F5EFE0",
    "--muted": "#1A1A1A",
    "--muted-foreground": "#8A8275",
    "--accent": "#D4AF37",
    "--accent-foreground": "#0A0A0A",
    "--border": "rgba(212, 175, 55, 0.20)",
    "--input": "#1A1A1A",
    "--ring": "#D4AF37",
    "--radius": "0.25rem",
    "--template-accent": "#D4AF37",
    "--template-glow": "rgba(212, 175, 55, 0.50)",
    "--template-surface": "#141414",
  },
  classes: {
    page: "min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#141414] to-[#0A0A0A] font-[Outfit] text-[#F5EFE0] relative overflow-hidden",
    card: "bg-gradient-to-b from-[#1A1A1A] to-[#141414] border border-[#D4AF37]/20 rounded-md p-9 transition-all duration-700 ease-out relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(212,175,55,0.15)]",
    cardHover: "hover:border-[#D4AF37]/60 hover:shadow-[0_30px_80px_-15px_rgba(212,175,55,0.30),inset_0_1px_0_0_rgba(212,175,55,0.30)] hover:-translate-y-1",
    button: "bg-gradient-to-b from-[#D4AF37] via-[#E6C158] to-[#B8941F] text-[#0A0A0A] rounded-md px-12 py-4 font-bold tracking-[0.15em] uppercase text-sm shadow-[0_10px_30px_-5px_rgba(212,175,55,0.45),inset_0_1px_0_0_rgba(255,255,255,0.30)] transition-all duration-500 border border-[#B8941F]",
    buttonOutline: "border-2 border-[#D4AF37] text-[#D4AF37] rounded-md px-12 py-4 font-bold tracking-[0.15em] uppercase text-sm bg-transparent transition-all duration-500 hover:bg-[#D4AF37]/10 hover:shadow-[0_0_30px_rgba(212,175,55,0.30)]",
    heading: "font-[Bodoni_Moda] font-normal text-[#F5EFE0] tracking-[0.005em] leading-[1.02] [text-shadow:0_0_28px_rgba(212,168,83,0.25),0_2px_4px_rgba(0,0,0,0.4)]",
    body: "font-[Outfit] font-light text-[#8A8275] leading-loose tracking-wide",
    badge: "bg-gradient-to-r from-[#D4AF37]/15 to-[#B8941F]/15 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 border border-[#D4AF37]/40 rounded-sm",
    input: "bg-[#1A1A1A] border border-[#D4AF37]/25 rounded-md px-5 py-3.5 text-[#F5EFE0] placeholder:text-[#8A8275]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all duration-400",
    timeSlot: "bg-[#141414] border border-[#D4AF37]/20 rounded-md px-5 py-3.5 text-sm text-[#F5EFE0] cursor-pointer transition-all duration-400 hover:border-[#D4AF37] hover:bg-[#1A1A1A] hover:shadow-[0_4px_16px_rgba(212,175,55,0.20)]",
    timeSlotActive: "bg-gradient-to-b from-[#D4AF37] to-[#B8941F] text-[#0A0A0A] border-[#D4AF37] rounded-md px-5 py-3.5 text-sm font-bold tracking-wider shadow-[0_8px_24px_rgba(212,175,55,0.40)] cursor-pointer",
    accentBar: "h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent",
    summaryBox: "bg-gradient-to-b from-[#1A1A1A] to-[#141414] border border-[#D4AF37]/20 rounded-md p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 slide-in-from-bottom-4 duration-900 ease-out",
    buttonHover: "hover:shadow-[0_15px_45px_-5px_rgba(212,175,55,0.65),inset_0_1px_0_0_rgba(255,255,255,0.40)] hover:-translate-y-0.5 active:translate-y-0",
    pageEnter: "animate-in fade-in-0 duration-1000 ease-out",
  },
  decorations: {
    background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(212,175,55,0.08) 0%, transparent 70%)",
    hasOrbs: false,
    hasGrid: false,
    hasConfetti: false,
    hasShimmer: true,
  },
};

// ─────────────────────────────────────────────────────────────
//  5. POP — colorful, energetic (kids stylists, creative therapists)
// ─────────────────────────────────────────────────────────────
const pop: TemplateDefinition = {
  id: "pop",
  name: "Pop",
  tagline: "Bright, bold, playful",
  audience: "Kids hairdressers, party planners, kids therapy, family photography",
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
    heading: "font-[Fredoka] font-bold text-[#2D1B69] tracking-[-0.01em] leading-[1.05]",
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
//  6. STUDIO — modern, vivid teal (clinical, medical aesthetics)
// ─────────────────────────────────────────────────────────────
const studio: TemplateDefinition = {
  id: "studio",
  name: "Studio",
  tagline: "Crisp, modern, vivid",
  audience: "Physiotherapy, dental, dermatology, fertility clinics, mental health",
  fonts: { heading: "Plus Jakarta Sans", body: "Plus Jakarta Sans" },
  cssVars: {
    "--background": "#F0FDFC",
    "--foreground": "#042F2E",
    "--card": "#FFFFFF",
    "--card-foreground": "#042F2E",
    "--primary": "#0891A1",
    "--primary-foreground": "#FFFFFF",
    "--secondary": "#CFFAFE",
    "--secondary-foreground": "#042F2E",
    "--muted": "#ECFEFF",
    "--muted-foreground": "#5C8B8C",
    "--accent": "#06B6D4",
    "--accent-foreground": "#FFFFFF",
    "--border": "#A5F3FC",
    "--input": "#FFFFFF",
    "--ring": "#0891A1",
    "--radius": "1rem",
    "--template-accent": "#0891A1",
    "--template-glow": "rgba(8, 145, 161, 0.35)",
    "--template-surface": "#ECFEFF",
  },
  classes: {
    page: "min-h-screen bg-gradient-to-br from-[#ECFEFF] via-[#F0FDFC] to-[#CFFAFE] font-[Plus_Jakarta_Sans] text-[#042F2E] relative overflow-hidden",
    card: "bg-white rounded-2xl border border-[#A5F3FC] p-7 transition-all duration-400 ease-out shadow-[0_10px_40px_-10px_rgba(8,145,161,0.20),0_2px_6px_rgba(8,145,161,0.06)]",
    cardHover: "hover:shadow-[0_25px_60px_-10px_rgba(8,145,161,0.35),0_4px_12px_rgba(8,145,161,0.10)] hover:-translate-y-1.5 hover:border-[#22D3EE]",
    button: "bg-gradient-to-r from-[#0891A1] via-[#06B6D4] to-[#22D3EE] text-white rounded-2xl px-10 py-4 font-bold text-sm tracking-wide shadow-[0_10px_30px_-5px_rgba(8,145,161,0.45)] transition-all duration-300",
    buttonOutline: "border-2 border-[#0891A1] text-[#0891A1] rounded-2xl px-10 py-4 font-bold text-sm bg-white transition-all duration-300 hover:bg-[#ECFEFF]",
    heading: "font-[Plus_Jakarta_Sans] font-extrabold text-[#042F2E] tracking-[-0.02em] leading-[1.05]",
    body: "font-[Plus_Jakarta_Sans] text-[#5C8B8C] leading-relaxed",
    badge: "bg-gradient-to-r from-[#CFFAFE] to-[#A5F3FC] text-[#042F2E] text-xs font-bold px-3 py-1 rounded-full border border-[#A5F3FC]",
    input: "bg-white border-2 border-[#A5F3FC] rounded-2xl px-5 py-3.5 text-[#042F2E] text-sm placeholder:text-[#5C8B8C]/60 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/30 focus:border-[#06B6D4] transition-all duration-300",
    timeSlot: "bg-white border-2 border-[#A5F3FC] rounded-2xl px-4 py-3.5 text-sm font-medium text-[#042F2E] cursor-pointer transition-all duration-300 hover:border-[#06B6D4] hover:bg-[#ECFEFF] hover:shadow-[0_4px_16px_rgba(6,182,212,0.20)]",
    timeSlotActive: "bg-gradient-to-r from-[#0891A1] to-[#06B6D4] text-white border-transparent rounded-2xl px-4 py-3.5 text-sm font-bold shadow-[0_8px_24px_rgba(8,145,161,0.45)] cursor-pointer",
    accentBar: "h-1.5 w-24 rounded-full bg-gradient-to-r from-[#0891A1] via-[#06B6D4] to-[#22D3EE] shadow-[0_2px_12px_rgba(8,145,161,0.40)]",
    summaryBox: "bg-white border border-[#A5F3FC] rounded-2xl p-8 shadow-[0_10px_40px_-10px_rgba(8,145,161,0.20)]",
  },
  animations: {
    cardEnter: "animate-in fade-in-0 slide-in-from-bottom-3 duration-600 ease-out",
    buttonHover: "hover:shadow-[0_15px_45px_-5px_rgba(8,145,161,0.60)] hover:-translate-y-1 active:translate-y-0",
    pageEnter: "animate-in fade-in-0 duration-700 ease-out",
  },
  decorations: {
    background: "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(6,182,212,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 85% 90%, rgba(8,145,161,0.15) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(165,243,252,0.20) 0%, transparent 70%)",
    hasOrbs: true,
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
