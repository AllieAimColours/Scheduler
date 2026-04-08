"use client";

import { useState } from "react";
import { TEMPLATES, TEMPLATE_IDS, type TemplateId } from "@/lib/templates/index";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

interface TemplatePickerProps {
  currentTemplate: TemplateId;
  onSelect: (templateId: TemplateId) => void;
}

export function TemplatePicker({ currentTemplate, onSelect }: TemplatePickerProps) {
  const [hoveredId, setHoveredId] = useState<TemplateId | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TEMPLATE_IDS.map((id) => {
        const template = TEMPLATES[id];
        const isSelected = currentTemplate === id;
        const isHovered = hoveredId === id;

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "relative group text-left rounded-xl border-2 p-0 overflow-hidden transition-all duration-300",
              isSelected
                ? "border-purple-500 ring-2 ring-purple-200 shadow-lg"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            )}
          >
            {/* Mini preview */}
            <div
              className="h-32 relative overflow-hidden"
              style={{
                background: template.cssVars["--background"] || "#fff",
                color: template.cssVars["--foreground"] || "#000",
              }}
            >
              {/* Decorative preview elements */}
              <div className="absolute inset-0 p-4 flex flex-col gap-2">
                {/* Mock header */}
                <div
                  className="text-xs font-semibold opacity-80"
                  style={{ fontFamily: template.fonts.heading }}
                >
                  Your Business
                </div>
                {/* Mock service cards */}
                <div className="flex flex-col gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2 py-1.5 rounded"
                      style={{
                        background: template.cssVars["--card"] || "#fff",
                        borderRadius: template.cssVars["--radius"] || "0.5rem",
                        border: `1px solid ${template.cssVars["--border"] || "#e5e5e5"}`,
                      }}
                    >
                      <div
                        className="w-1 h-4 rounded-full"
                        style={{
                          background: template.cssVars["--primary"] || "#6366f1",
                        }}
                      />
                      <div className="flex-1">
                        <div
                          className="h-1.5 rounded-full w-16 opacity-60"
                          style={{
                            background: template.cssVars["--foreground"] || "#000",
                          }}
                        />
                      </div>
                      <div
                        className="text-[8px] font-bold opacity-70"
                        style={{
                          color: template.cssVars["--primary"] || "#6366f1",
                        }}
                      >
                        $50
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3 bg-white border-t">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">
                  {template.name}
                </span>
                {isSelected && (
                  <span className="text-[10px] uppercase tracking-wider text-purple-600 font-bold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {template.tagline}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {template.audience}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}