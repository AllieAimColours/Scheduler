"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink, Monitor, Smartphone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [key, setKey] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("providers")
        .select("slug")
        .eq("user_id", user.id)
        .single();

      if (data) setSlug(data.slug);
    }
    load();
  }, []);

  if (!slug) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-400">
        Loading preview...
      </div>
    );
  }

  const bookingUrl = `/book/${slug}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Client View
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            This is what your clients see when they visit your booking page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-2 rounded-md transition-colors ${
                device === "desktop"
                  ? "bg-white shadow-sm text-purple-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-2 rounded-md transition-colors ${
                device === "mobile"
                  ? "bg-white shadow-sm text-purple-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setKey((k) => k + 1)}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Full Page
          </a>
        </div>
      </div>

      {/* Browser Chrome Frame */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* URL bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 border">
            yoursite.com/book/{slug}
          </div>
        </div>

        {/* Iframe */}
        <div
          className={`mx-auto transition-all duration-300 bg-white ${
            device === "mobile" ? "max-w-[375px]" : "w-full"
          }`}
        >
          <iframe
            key={key}
            src={bookingUrl}
            className="w-full border-0"
            style={{ height: "75vh" }}
            title="Booking page preview"
          />
        </div>
      </div>
    </div>
  );
}
