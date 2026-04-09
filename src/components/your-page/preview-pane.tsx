"use client";

import { useState } from "react";
import { ExternalLink, Smartphone, Monitor, RotateCcw } from "lucide-react";

export function PreviewPane({ slug, dirty }: { slug: string; dirty: boolean }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Live preview</div>
          {dirty && (
            <div className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              Unsaved
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "desktop" ? "bg-white shadow-sm text-purple-600" : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Desktop view"
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "mobile" ? "bg-white shadow-sm text-purple-600" : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Mobile view"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 text-gray-400 hover:text-purple-600 rounded-md transition-colors"
            aria-label="Refresh preview"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <a
            href={`/book/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-purple-600 rounded-md transition-colors"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Iframe */}
      <div
        className={`mx-auto bg-white transition-all duration-300 ${
          device === "mobile" ? "max-w-[375px]" : "w-full"
        }`}
      >
        <iframe
          key={refreshKey}
          src={`/book/${slug}`}
          className="w-full border-0"
          style={{ height: "calc(100vh - 240px)", minHeight: "600px" }}
          title="Booking page preview"
        />
      </div>

      {dirty && (
        <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 text-center">
          Click <strong>Publish changes</strong> to update the live page
        </div>
      )}
    </div>
  );
}
