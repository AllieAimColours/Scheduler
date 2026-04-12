"use client";

import { Sparkles, Check } from "lucide-react";
import { getTemplate, type TemplateId } from "@/lib/templates/index";
import { cn } from "@/lib/utils";

interface Props {
  heading: string;
  message: string;
  onHeadingChange: (next: string) => void;
  onMessageChange: (next: string) => void;
  template: TemplateId;
}

export function ConfirmationEditor({
  heading,
  message,
  onHeadingChange,
  onMessageChange,
  template,
}: Props) {
  const tmpl = getTemplate(template);
  const sampleName = "Sarah";
  const previewHeading = heading.trim() || "You're booked!";
  const previewMessage = message.trim()
    ? message.replace(/\{name\}/gi, sampleName)
    : `We'll see you soon, ${sampleName}.`;

  return (
    <div className="space-y-5">
      {/* Editor card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h2 className="font-display text-base font-bold text-gray-800">
            Confirmation page
          </h2>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700">Heading</label>
          <input
            type="text"
            value={heading}
            onChange={(e) => onHeadingChange(e.target.value)}
            placeholder="You're booked!"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none"
          />
          {heading.trim() === "" && (
            <p className="text-[11px] text-gray-400">
              Default: <em>&quot;You&apos;re booked!&quot;</em>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="We'll see you soon, {name}!"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none resize-none"
          />
          <p className="text-[11px] text-gray-400">
            Use <span className="font-mono text-purple-600">{`{name}`}</span> to insert the client&apos;s first name.
            {message.trim() === "" && <> Default: <em>&quot;We&apos;ll see you soon, [name].&quot;</em></>}
          </p>
        </div>
      </div>

      {/* Live preview card — mimics the confirmation page styling */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Preview</div>
          <div className="flex items-center gap-1 text-[10px] text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Real-time
          </div>
        </div>
        <div
          className="rounded-2xl p-8 shadow-sm border"
          style={{
            background: tmpl.cssVars["--background"] || "#ffffff",
            borderColor: tmpl.cssVars["--border"] || "#e5e5e5",
          }}
        >
          {/* Render the actual confirmation visual using the active template's classes */}
          <div className="text-center">
            <div className="relative inline-block mb-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: `linear-gradient(135deg, ${tmpl.cssVars["--template-accent"] || "#a855f7"}, ${tmpl.cssVars["--primary"] || "#ec4899"})`,
                }}
              >
                <Check className="h-8 w-8 text-white" strokeWidth={3} />
              </div>
            </div>
            <h1
              className={cn("text-3xl mb-3", tmpl.classes.heading)}
              style={{
                fontFamily: tmpl.cssVars["--font-heading"],
                color: tmpl.cssVars["--foreground"] || "#1a1a1a",
              }}
            >
              {previewHeading}
            </h1>
            <p
              className={cn("text-base", tmpl.classes.body)}
              style={{
                fontFamily: tmpl.cssVars["--font-body"],
                color: tmpl.cssVars["--muted-foreground"] || "#888",
              }}
            >
              {previewMessage}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-gray-400">
          The full confirmation page also includes the booking details, calendar export buttons, and contact actions — only the message above is customizable here.
        </p>
      </div>
    </div>
  );
}
