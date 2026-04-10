"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "bloom-pwa-prompt-dismissed";
const DISMISS_DURATION_DAYS = 14;

export function InstallPwaPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't even attach if recently dismissed
    const dismissedAt = typeof window !== "undefined" ? localStorage.getItem(DISMISSED_KEY) : null;
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      const limit = DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000;
      if (elapsed < limit) return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      // Don't pop instantly — wait a few seconds so the user has a moment
      setTimeout(() => setVisible(true), 4000);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Hide once installed
  useEffect(() => {
    function installed() {
      setVisible(false);
      setDeferred(null);
    }
    window.addEventListener("appinstalled", installed);
    return () => window.removeEventListener("appinstalled", installed);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setDeferred(null);
    }
  }

  if (!visible || !deferred) return null;

  return (
    <div
      className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-sm z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-500"
      role="dialog"
      aria-labelledby="pwa-install-title"
    >
      <div className="relative rounded-2xl bg-white shadow-2xl border border-purple-100 p-5 overflow-hidden">
        {/* Subtle gradient glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-purple-300/30 to-pink-300/30 blur-2xl pointer-events-none" />

        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex items-start gap-3 pr-6">
          <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="pwa-install-title" className="font-display text-base font-semibold text-gray-800">
              Install Bloom
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Add Bloom to your home screen for faster access — works like a real app.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={install}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Install
              </button>
              <button
                onClick={dismiss}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
