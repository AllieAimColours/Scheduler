"use client";

import type { TemplateId } from "@/lib/templates/index";
import { getTemplate } from "@/lib/templates/index";
import { TemplateProvider } from "@/lib/templates/context";
import { Decorations } from "./decorations";
import { cn } from "@/lib/utils";

interface TemplateWrapperProps {
  templateId: TemplateId;
  cssVars: Record<string, string>;
  fontClasses: string;
  children: React.ReactNode;
}

export function TemplateWrapper({
  templateId,
  cssVars,
  fontClasses,
  children,
}: TemplateWrapperProps) {
  const template = getTemplate(templateId);

  return (
    <TemplateProvider value={templateId}>
      <div
        className={cn(template.classes.page, template.animations.pageEnter, fontClasses)}
        style={cssVars as React.CSSProperties}
      >
        <Decorations />
        <div className="relative z-10">{children}</div>
      </div>
    </TemplateProvider>
  );
}
