"use client";

import { useId } from "react";
import type { TemplateId } from "@/lib/templates/index";
import { getTemplate } from "@/lib/templates/index";
import { TemplateProvider } from "@/lib/templates/context";
import { Decorations } from "./decorations";
import { cn } from "@/lib/utils";
import { fontFamilyFor, type PageOverrides } from "@/lib/page-builder/overrides";
import { CursorEffects, AmbientParticlesEffect, ConfettiBurst, ClickBurst } from "./wow-effects";

interface TemplateWrapperProps {
  templateId: TemplateId;
  cssVars: Record<string, string>;
  fontClasses: string;
  overrides?: PageOverrides;
  children: React.ReactNode;
}

/**
 * Build a scoped <style> block that overrides the template's baked-in
 * Tailwind classes. We use attribute matchers + !important to win
 * specificity against utility classes.
 */
function buildOverrideCss(scope: string, overrides: PageOverrides): string {
  const rules: string[] = [];

  if (overrides.heading_font) {
    const family = fontFamilyFor(overrides.heading_font);
    if (family) {
      const familyName = family.replace(/_/g, " ");
      rules.push(
        `${scope} h1, ${scope} h2, ${scope} h3, ${scope} h4, ${scope} h5, ${scope} h6 { font-family: '${familyName}', serif !important; font-style: normal !important; }`
      );
    }
  }

  if (overrides.body_font) {
    const family = fontFamilyFor(overrides.body_font);
    if (family) {
      const familyName = family.replace(/_/g, " ");
      rules.push(
        `${scope} p, ${scope} li, ${scope} input, ${scope} textarea, ${scope} button, ${scope} a, ${scope} label { font-family: '${familyName}', sans-serif !important; }`
      );
    }
  }

  // Color overrides — best-effort against template-baked Tailwind classes.
  if (overrides.primary_color) {
    const c = overrides.primary_color;
    rules.push(
      // Any element with a Tailwind gradient → replace with flat override
      `${scope} [class*="bg-gradient"] { background-image: none !important; background-color: ${c} !important; }`,
      // Solid bg-[#hex] patterns (escape brackets via attribute matcher)
      `${scope} button[class*="bg-["], ${scope} a[class*="bg-["] { background-color: ${c} !important; background-image: none !important; }`,
      // Time slot active state etc.
      `${scope} [class*="text-template-accent"] { color: ${c} !important; }`
    );
  }

  if (overrides.accent_color) {
    const c = overrides.accent_color;
    rules.push(
      // Accent bar gradients
      `${scope} [class*="accent-bar"], ${scope} .h-1 { background-image: linear-gradient(to right, ${c}, ${c}) !important; background-color: ${c} !important; }`
    );
  }

  if (overrides.background_color) {
    const c = overrides.background_color;
    rules.push(
      `${scope} { background: ${c} !important; background-image: none !important; }`
    );
  }

  return rules.join("\n");
}

export function TemplateWrapper({
  templateId,
  cssVars,
  fontClasses,
  overrides,
  children,
}: TemplateWrapperProps) {
  const template = getTemplate(templateId);
  const scopeId = useId().replace(/:/g, "");
  const scopeClass = `tpl-${scopeId}`;

  // Decorations level: "off" hides them entirely
  const showDecorations = overrides?.decorations !== "off";

  // Animation speed multiplier — applied as a CSS variable
  const animationSpeedMap: Record<string, string> = {
    still: "0",
    gentle: "0.6",
    default: "1",
    playful: "1.4",
  };
  const animSpeed = animationSpeedMap[overrides?.animation || "default"] || "1";

  const inlineStyle: React.CSSProperties = {
    ...(cssVars as React.CSSProperties),
    ["--anim-speed" as string]: animSpeed,
  };

  // Build scoped override CSS only if any overrides are set
  const hasOverrides = overrides && (
    overrides.heading_font ||
    overrides.body_font ||
    overrides.primary_color ||
    overrides.accent_color
  );
  const overrideCss = hasOverrides
    ? buildOverrideCss(`.${scopeClass}`, overrides)
    : "";

  const accentColor = (cssVars as Record<string, string>)["--template-accent"];

  return (
    <TemplateProvider value={templateId}>
      {overrideCss && (
        <style dangerouslySetInnerHTML={{ __html: overrideCss }} />
      )}
      <div
        className={cn(
          scopeClass,
          template.classes.page,
          template.animations.pageEnter,
          fontClasses
        )}
        style={inlineStyle}
      >
        {showDecorations && <Decorations />}

        {/* Wow effects — cursor, particles, confetti */}
        {overrides?.cursor_effect && overrides.cursor_effect !== "none" && (
          <CursorEffects
            effect={overrides.cursor_effect}
            emoji={overrides.cursor_emoji}
            accentColor={accentColor}
            intensity={overrides.cursor_intensity ?? 50}
            colorMode={overrides.particle_color_mode}
            customColor={overrides.particle_custom_color}
          />
        )}
        {overrides?.ambient_particles && overrides.ambient_particles !== "none" && (
          <AmbientParticlesEffect
            type={overrides.ambient_particles}
            accentColor={accentColor}
            intensity={overrides.ambient_intensity ?? 50}
            colorMode={overrides.particle_color_mode}
            customColor={overrides.particle_custom_color}
          />
        )}
        {overrides?.confetti_on_load && (
          <ConfettiBurst
            accentColor={accentColor}
            colorMode={overrides.particle_color_mode}
            customColor={overrides.particle_custom_color}
          />
        )}
        {overrides?.click_burst && overrides.click_burst !== "none" && (
          <ClickBurst
            style={overrides.click_burst}
            emoji={overrides.click_burst_emoji}
            accentColor={accentColor}
            colorMode={overrides.particle_color_mode}
            customColor={overrides.particle_custom_color}
          />
        )}

        <div className="relative z-10">{children}</div>
      </div>
    </TemplateProvider>
  );
}
