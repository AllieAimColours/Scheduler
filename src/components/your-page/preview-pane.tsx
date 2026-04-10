"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Smartphone, Monitor } from "lucide-react";
import type { PageSection } from "@/lib/page-builder/types";
import type { TemplateId } from "@/lib/templates/index";
import type { PageOverrides } from "@/lib/page-builder/overrides";

interface Props {
  slug: string;
  template: TemplateId;
  sections: PageSection[];
  overrides?: PageOverrides;
}

export function PreviewPane({ slug, template, sections, overrides }: Props) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for the "ready" handshake from the iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "preview-ready") {
        setIframeReady(true);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Push updates to the iframe whenever template/sections/overrides change
  useEffect(() => {
    if (!iframeReady || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "preview-update", template, sections, overrides },
      "*"
    );
  }, [template, sections, overrides, iframeReady]);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Live preview</div>
          <div className="flex items-center gap-1 text-[10px] text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Real-time
          </div>
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
          <a
            href={`/book/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-purple-600 rounded-md transition-colors"
            aria-label="Open published page"
            title="Open the published version"
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
          ref={iframeRef}
          src="/page-preview"
          className="w-full border-0"
          style={{ height: "calc(100vh - 240px)", minHeight: "600px" }}
          title="Live preview"
        />
      </div>
    </div>
  );
}
