"use client";

import { TEMPLATE_IDS, getTemplate, type TemplateId } from "@/lib/templates/index";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  selected: TemplateId;
  onSelect: (t: TemplateId) => void;
}

export function TemplateBar({ selected, onSelect }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-100 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 mb-1">
            Step 1 · Pick a vibe
          </div>
          <h2 className="font-display text-xl text-gray-800">
            Choose your template
          </h2>
        </div>
        <p className="text-xs text-gray-400 max-w-xs text-right hidden md:block">
          Switching templates instantly transforms your entire booking page —
          fonts, colors, animations, and decorations.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TEMPLATE_IDS.map((id) => {
          const t = getTemplate(id);
          const isActive = id === selected;
          const swatch = t.cssVars["--primary"] || "#8b5cf6";
          const bg = t.cssVars["--background"] || "#ffffff";
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 border-2",
                isActive
                  ? "border-purple-400 shadow-xl scale-105 ring-4 ring-purple-100"
                  : "border-transparent hover:border-purple-200 hover:shadow-md hover:-translate-y-0.5"
              )}
              style={{ backgroundColor: bg }}
            >
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full shadow-inner"
                  style={{ backgroundColor: swatch }}
                />
                <div
                  className="font-bold text-sm"
                  style={{ color: t.cssVars["--foreground"] || "#000" }}
                >
                  {t.name}
                </div>
              </div>
              <div
                className="text-[11px] line-clamp-2 opacity-70"
                style={{ color: t.cssVars["--foreground"] || "#000" }}
              >
                {t.tagline}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
