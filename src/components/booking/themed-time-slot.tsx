"use client";

import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";

interface ThemedTimeSlotProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
}

export function ThemedTimeSlot({
  isSelected = false,
  className,
  children,
  ...props
}: ThemedTimeSlotProps) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  return (
    <button
      className={cn(
        isSelected
          ? template.classes.timeSlotActive
          : template.classes.timeSlot,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
