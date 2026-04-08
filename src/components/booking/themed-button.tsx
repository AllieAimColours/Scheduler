"use client";

import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";

interface ThemedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function ThemedButton({
  variant = "default",
  className,
  children,
  ...props
}: ThemedButtonProps) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  const baseClass =
    variant === "outline"
      ? template.classes.buttonOutline
      : template.classes.button;

  return (
    <button
      className={cn(baseClass, template.animations.buttonHover, className)}
      {...props}
    >
      {children}
    </button>
  );
}
