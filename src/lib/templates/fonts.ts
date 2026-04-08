import {
  Cormorant_Garamond,
  Playfair_Display,
  DM_Sans,
  Space_Grotesk,
  JetBrains_Mono,
  Bodoni_Moda,
  Outfit,
  Fredoka,
  Nunito,
  Plus_Jakarta_Sans,
  Inter,
} from "next/font/google";

// ---------------------------------------------------------------------------
// Aura
// ---------------------------------------------------------------------------
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

// ---------------------------------------------------------------------------
// Bloom
// ---------------------------------------------------------------------------
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

// ---------------------------------------------------------------------------
// Edge
// ---------------------------------------------------------------------------
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

// ---------------------------------------------------------------------------
// Luxe
// ---------------------------------------------------------------------------
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-bodoni",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-outfit",
});

// ---------------------------------------------------------------------------
// Pop
// ---------------------------------------------------------------------------
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-nunito",
});

// ---------------------------------------------------------------------------
// Studio
// ---------------------------------------------------------------------------
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

// ---------------------------------------------------------------------------
// All font instances for easy iteration
// ---------------------------------------------------------------------------
const allFonts = [
  cormorantGaramond,
  inter,
  playfairDisplay,
  dmSans,
  spaceGrotesk,
  jetbrainsMono,
  bodoniModa,
  outfit,
  fredoka,
  nunito,
  plusJakartaSans,
];

/**
 * Combined className string of every font's CSS-variable class.
 * Apply this to `<html>` so all variables are available everywhere.
 */
export const allFontVariables: string = allFonts
  .map((f) => f.variable)
  .join(" ");

// ---------------------------------------------------------------------------
// Template → fonts mapping
// ---------------------------------------------------------------------------
type FontInstance = typeof inter;

const templateFontsMap: Record<
  string,
  { heading: FontInstance; body: FontInstance }
> = {
  aura: { heading: cormorantGaramond, body: inter },
  bloom: { heading: playfairDisplay, body: dmSans },
  edge: { heading: spaceGrotesk, body: jetbrainsMono },
  luxe: { heading: bodoniModa, body: outfit },
  pop: { heading: fredoka, body: nunito },
  studio: { heading: plusJakartaSans, body: plusJakartaSans },
};

/**
 * Return the heading and body font instances for a given template.
 * Falls back to Studio fonts if the templateId is unknown.
 */
export function getTemplateFonts(templateId: string): {
  heading: FontInstance;
  body: FontInstance;
} {
  return (
    templateFontsMap[templateId.toLowerCase()] ?? templateFontsMap["studio"]
  );
}
