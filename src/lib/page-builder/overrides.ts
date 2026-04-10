// ─────────────────────────────────────────────────────────────
//  Page customization overrides — sit on top of templates
// ─────────────────────────────────────────────────────────────
//
//  Templates are great defaults. This module lets a power user
//  override individual styles (heading font, accent color,
//  radius, etc.) without abandoning the template.
//
//  All fields are optional. The merge function turns a (template,
//  overrides) pair into a final cssVars object that the
//  TemplateWrapper consumes.
//

// One of the 11 preloaded fonts in src/lib/templates/fonts.ts.
// We don't allow arbitrary font names because adding a font means
// adding it to the next/font preload, which is build-time.
export type FontChoice =
  | "default"             // use template's font
  | "cormorant-garamond"
  | "playfair-display"
  | "space-grotesk"
  | "jetbrains-mono"
  | "bodoni-moda"
  | "outfit"
  | "fredoka"
  | "nunito"
  | "plus-jakarta-sans"
  | "dm-sans"
  | "inter";

export const FONT_OPTIONS: Array<{ id: FontChoice; label: string; family: string }> = [
  { id: "default", label: "Use template font", family: "" },
  { id: "cormorant-garamond", label: "Cormorant Garamond (elegant serif)", family: "Cormorant_Garamond" },
  { id: "playfair-display", label: "Playfair Display (luxury serif)", family: "Playfair_Display" },
  { id: "bodoni-moda", label: "Bodoni Moda (dramatic serif)", family: "Bodoni_Moda" },
  { id: "fredoka", label: "Fredoka (round playful)", family: "Fredoka" },
  { id: "space-grotesk", label: "Space Grotesk (modern bold)", family: "Space_Grotesk" },
  { id: "outfit", label: "Outfit (clean modern)", family: "Outfit" },
  { id: "plus-jakarta-sans", label: "Plus Jakarta Sans (premium sans)", family: "Plus_Jakarta_Sans" },
  { id: "dm-sans", label: "DM Sans (warm sans)", family: "DM_Sans" },
  { id: "inter", label: "Inter (neutral sans)", family: "Inter" },
  { id: "nunito", label: "Nunito (friendly sans)", family: "Nunito" },
  { id: "jetbrains-mono", label: "JetBrains Mono (technical)", family: "JetBrains_Mono" },
];

export type RadiusChoice = "default" | "sharp" | "soft" | "round" | "pill";
export type DecorationsLevel = "default" | "off" | "subtle" | "normal" | "bold";
export type AnimationSpeed = "default" | "still" | "gentle" | "playful";

export interface PageOverrides {
  // Optional font overrides
  heading_font?: FontChoice;
  body_font?: FontChoice;

  // Optional color overrides (CSS color strings)
  primary_color?: string;
  accent_color?: string;
  background_color?: string;

  // Visual scale
  radius?: RadiusChoice;
  decorations?: DecorationsLevel;
  animation?: AnimationSpeed;
}

const RADIUS_VALUES: Record<RadiusChoice, string | undefined> = {
  default: undefined,
  sharp: "0.25rem",
  soft: "0.75rem",
  round: "1.5rem",
  pill: "2.5rem",
};

/**
 * Merge a template's cssVars with the user's overrides.
 * Returns a new cssVars object — does not mutate inputs.
 */
export function mergeOverrides(
  templateVars: Record<string, string>,
  overrides: PageOverrides | undefined
): Record<string, string> {
  if (!overrides) return { ...templateVars };

  const merged: Record<string, string> = { ...templateVars };

  if (overrides.primary_color) {
    merged["--primary"] = overrides.primary_color;
    merged["--ring"] = overrides.primary_color;
    merged["--template-accent"] = overrides.primary_color;
  }
  if (overrides.accent_color) {
    merged["--accent"] = overrides.accent_color;
  }
  if (overrides.background_color) {
    merged["--background"] = overrides.background_color;
  }

  const radiusValue = overrides.radius ? RADIUS_VALUES[overrides.radius] : undefined;
  if (radiusValue) {
    merged["--radius"] = radiusValue;
  }

  return merged;
}

/**
 * Look up the CSS font-family string for a given FontChoice.
 * Returns undefined if "default" or unknown — caller should fall back to template.
 */
export function fontFamilyFor(choice: FontChoice | undefined): string | undefined {
  if (!choice || choice === "default") return undefined;
  const opt = FONT_OPTIONS.find((f) => f.id === choice);
  return opt?.family;
}

/**
 * Parse raw branding.overrides JSON into a typed PageOverrides.
 * Always returns a safe object (never throws).
 */
export function parseOverrides(raw: unknown): PageOverrides {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    heading_font: typeof o.heading_font === "string" ? (o.heading_font as FontChoice) : undefined,
    body_font: typeof o.body_font === "string" ? (o.body_font as FontChoice) : undefined,
    primary_color: typeof o.primary_color === "string" ? o.primary_color : undefined,
    accent_color: typeof o.accent_color === "string" ? o.accent_color : undefined,
    background_color: typeof o.background_color === "string" ? o.background_color : undefined,
    radius: typeof o.radius === "string" ? (o.radius as RadiusChoice) : undefined,
    decorations: typeof o.decorations === "string" ? (o.decorations as DecorationsLevel) : undefined,
    animation: typeof o.animation === "string" ? (o.animation as AnimationSpeed) : undefined,
  };
}
