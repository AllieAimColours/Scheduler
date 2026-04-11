"use client";

/**
 * Rotating template preview card for the marketing landing.
 *
 * Each card cycles through a list of fake businesses (across different
 * industries) so visitors see that one template can serve many kinds of
 * service providers. Cards stagger their rotation so they do not all
 * change at the same instant.
 */

import { useEffect, useState } from "react";
import type { TemplateDefinition } from "@/lib/templates/index";
import { PREVIEW_EXAMPLES } from "@/lib/templates/preview-examples";

const ROTATION_INTERVAL_MS = 4500;

interface Props {
  template: TemplateDefinition;
  staggerOffset?: number; // ms — so multiple cards do not rotate in unison
}

export function TemplatePreviewCard({ template, staggerOffset = 0 }: Props) {
  const examples = PREVIEW_EXAMPLES[template.id];
  const [exampleIdx, setExampleIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!examples || examples.length <= 1) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // Initial stagger so cards do not all switch at the same instant
    const startTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        setFading(true);
        fadeTimeoutId = setTimeout(() => {
          setExampleIdx((prev) => (prev + 1) % examples.length);
          setFading(false);
        }, 350);
      }, ROTATION_INTERVAL_MS);
    }, staggerOffset);

    return () => {
      clearTimeout(startTimer);
      if (intervalId) clearInterval(intervalId);
      if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
    };
  }, [examples, staggerOffset]);

  if (!examples || examples.length === 0) {
    return null;
  }

  const example = examples[exampleIdx];

  return (
    <div className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Themed mini preview */}
      <div
        className="h-44 relative overflow-hidden p-5"
        style={{
          background: template.cssVars["--background"] || "#fff",
          color: template.cssVars["--foreground"] || "#000",
        }}
      >
        <div
          className={`space-y-2 transition-opacity duration-700 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Business name */}
          <div
            className="text-sm font-bold opacity-80 truncate"
            style={{ fontFamily: template.fonts.heading }}
          >
            {example.business}
          </div>

          {/* Services */}
          {example.services.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between px-3 py-2"
              style={{
                background: template.cssVars["--card"] || "#fff",
                borderRadius: template.cssVars["--radius"] || "0.5rem",
                border: `1px solid ${template.cssVars["--border"] || "#e5e5e5"}`,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs shrink-0">{svc.emoji}</span>
                <span
                  className="text-xs font-medium truncate"
                  style={{
                    color:
                      template.cssVars["--card-foreground"] ||
                      template.cssVars["--foreground"] ||
                      "#000",
                  }}
                >
                  {svc.name}
                </span>
              </div>
              <span
                className="text-xs font-bold shrink-0 ml-2"
                style={{ color: template.cssVars["--primary"] || "#6366f1" }}
              >
                ${svc.price}
              </span>
            </div>
          ))}
        </div>

        {/* Rotation dots indicator */}
        {examples.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            {examples.map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full transition-all duration-500"
                style={{
                  backgroundColor:
                    i === exampleIdx
                      ? template.cssVars["--primary"] || "#6366f1"
                      : "rgba(0,0,0,0.15)",
                  width: i === exampleIdx ? "10px" : "4px",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 border-t">
        <h3 className="font-bold text-lg">{template.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{template.tagline}</p>
        <p className="text-xs text-gray-400 mt-2">{template.audience}</p>
      </div>
    </div>
  );
}
