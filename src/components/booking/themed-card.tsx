"use client";

import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";

interface ThemedCardProps extends React.ComponentProps<"div"> {
  index?: number;
}

export function ThemedCard({
  index = 0,
  className,
  children,
  ...props
}: ThemedCardProps) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  return (
    <div
      className={cn(
        template.classes.card,
        template.classes.cardHover,
        template.animations.cardEnter,
        className
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
      {...props}
    >
      {children}
    </div>
  );
}
