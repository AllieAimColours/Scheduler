"use client";

import { useId } from "react";
import type { TemplateId } from "@/lib/templates/index";
import { getTemplate } from "@/lib/templates/index";
import { TemplateProvider } from "@/lib/templates/context";
import { Decorations } from "./decorations";
import { cn } from "@/lib/utils";
import { fontFamilyFor, type PageOverrides } from "@/lib/page-builder/overrides";

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
        `${scope} h1, ${scope} h2, ${scope} h3, ${scope} h4 { font-family: '${familyName}', sans-serif !important; }`
      );
    }
  }

  if (overrides.body_font) {
    const family = fontFamilyFor(overrides.body_font);
    if (family) {
      const familyName = family.replace(/_/g, " ");
      rules.push(
        `${scope} p, ${scope} span:not(.no-font-override), ${scope} li, ${scope} input, ${scope} textarea, ${scope} button { font-family: '${familyName}', sans-serif !important; }`
      );
    }
  }

  // Color overrides — best-effort against arbitrary Tailwind values.
  // We target common bg/text/border patterns inside the scope.
  if (overrides.primary_color) {
    const c = overrides.primary_color;
    rules.push(
      // Buttons with gradient backgrounds → flat override color
      `${scope} button[class*="bg-gradient-to-r"], ${scope} a[class*="bg-gradient-to-r"], ${scope} button[class*="bg-gradient-to-b"], ${scope} a[class*="bg-gradient-to-b"] { background-image: none !important; background-color: ${c} !important; }`,
      // Solid background buttons
      `${scope} button[class*="bg-["], ${scope} a[class*="bg-["] { background-color: ${c} !important; }`
    );
  }

  if (overrides.accent_color) {
    const c = overrides.accent_color;
    rules.push(
      // Accent bars + decorative dots
      `${scope} [class*="from-["][class*="to-["] { background-image: linear-gradient(to right, ${c}, ${c}) !important; }`
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
        <div className="relative z-10">{children}</div>
      </div>
    </TemplateProvider>
  );
}
