"use client";

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

export function TemplateWrapper({
  templateId,
  cssVars,
  fontClasses,
  overrides,
  children,
}: TemplateWrapperProps) {
  const template = getTemplate(templateId);

  // Build inline style overrides for fonts (since classNames are template-baked)
  const headingFamily = fontFamilyFor(overrides?.heading_font);
  const bodyFamily = fontFamilyFor(overrides?.body_font);

  // Decorations level: "off" hides them entirely
  const showDecorations = overrides?.decorations !== "off";

  // Animation speed multiplier — applied as a CSS variable that animations can read
  const animationSpeedMap: Record<string, string> = {
    still: "0",
    gentle: "0.6",
    default: "1",
    playful: "1.4",
  };
  const animSpeed = animationSpeedMap[overrides?.animation || "default"] || "1";

  const inlineStyle: React.CSSProperties = {
    ...(cssVars as React.CSSProperties),
    ...(headingFamily ? { ["--font-heading-override" as string]: `'${headingFamily.replace(/_/g, " ")}', sans-serif` } : {}),
    ...(bodyFamily ? { ["--font-body-override" as string]: `'${bodyFamily.replace(/_/g, " ")}', sans-serif` } : {}),
    ["--anim-speed" as string]: animSpeed,
  };

  return (
    <TemplateProvider value={templateId}>
      <div
        className={cn(
          template.classes.page,
          template.animations.pageEnter,
          fontClasses,
          headingFamily && "[&_h1]:font-[var(--font-heading-override)] [&_h2]:font-[var(--font-heading-override)] [&_h3]:font-[var(--font-heading-override)]",
          bodyFamily && "[&_p]:font-[var(--font-body-override)] [&_span]:font-[var(--font-body-override)]"
        )}
        style={inlineStyle}
      >
        {showDecorations && <Decorations />}
        <div className="relative z-10">{children}</div>
      </div>
    </TemplateProvider>
  );
}
