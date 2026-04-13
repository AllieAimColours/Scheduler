"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar as CalIcon,
  Check,
  Star,
  Trash2,
  AlertCircle,
  X,
  ExternalLink,
  Apple,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───

interface Connection {
  id: string;
  calendar_type: "google" | "microsoft" | "caldav";
  calendar_name: string;
  account_email: string | null;
  is_primary: boolean;
  is_read_enabled: boolean;
  is_write_enabled: boolean;
  sync_error: string | null;
  last_synced_at: string | null;
  created_at: string;
}

const PROVIDER_META = {
  google: {
    name: "Google Calendar",
    accent: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  microsoft: {
    name: "Microsoft Outlook",
    accent: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50",
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-500",
  },
  caldav: {
    name: "Apple iCloud",
    accent: "from-slate-700 to-zinc-900",
    bg: "bg-slate-50",
    iconBg: "bg-gradient-to-br from-slate-700 to-zinc-900",
  },
} as const;

function IntegrationsContent() {
  const params = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppleModal, setShowAppleModal] = useState(false);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/calendar/connections");
    if (res.ok) {
      const data = await res.json();
      setConnections(data.connections || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Show toasts based on URL params after OAuth callback
  useEffect(() => {
    const connected = params.get("connected");
    const error = params.get("error");
    if (connected) {
      const name =
        connected === "google"
          ? "Google Calendar"
          : connected === "microsoft"
          ? "Microsoft Outlook"
          : connected;
      toast.success(`${name} connected!`);
      // Strip params from URL
      window.history.replaceState({}, "", "/integrations");
    }
    if (error) {
      toast.error(`Connection failed: ${error}`);
      window.history.replaceState({}, "", "/integrations");
    }
  }, [params]);

  async function handleConnect(provider: "google" | "microsoft") {
    const res = await fetch(`/api/calendar/${provider}/connect`, {
      method: "POST",
    });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Failed to start connection");
    }
  }

  async function handleSetPrimary(id: string) {
    const res = await fetch("/api/calendar/connections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_primary: true }),
    });
    if (res.ok) {
      toast.success("Primary calendar updated");
      fetchConnections();
    } else {
      toast.error("Failed to update");
    }
  }

  async function handleToggleRead(id: string, current: boolean) {
    const res = await fetch("/api/calendar/connections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_read_enabled: !current }),
    });
    if (res.ok) {
      fetchConnections();
    }
  }

  async function handleDisconnect(id: string, name: string) {
    if (!confirm(`Disconnect ${name}? Bookings will stop syncing to this calendar.`)) {
      return;
    }
    const res = await fetch(`/api/calendar/connections?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Calendar disconnected");
      fetchConnections();
    } else {
      toast.error("Failed to disconnect");
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Calendar Integrations
        </h1>
        <p className="text-gray-500 mt-1">
          Connect your calendars so bookings show up everywhere and external events block your availability.
        </p>
      </div>

      {/* Connected accounts */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mr-2" />
          Loading…
        </div>
      ) : connections.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
            <CalIcon className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="font-display text-xl font-semibold text-gray-800 mb-1">No calendars connected yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Connect Google, Outlook, or iCloud below to start two-way syncing your bookings.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Connected accounts ({connections.length})
          </h2>
          {connections.map((conn) => {
            const meta = PROVIDER_META[conn.calendar_type];
            return (
              <div
                key={conn.id}
                className="rounded-2xl bg-white border border-gray-100 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl ${meta.iconBg} text-white shadow-md`}>
                    {conn.calendar_type === "caldav" ? (
                      <Apple className="h-6 w-6" />
                    ) : (
                      <CalIcon className="h-6 w-6" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-lg font-bold text-gray-800">
                        {meta.name}
                      </span>
                      {conn.is_primary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          Primary
                        </span>
                      )}
                      {conn.sync_error && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                          <AlertCircle className="h-2.5 w-2.5" />
                          Sync error
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {conn.account_email}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Calendar: <span className="text-gray-600">{conn.calendar_name}</span>
                      {conn.last_synced_at && (
                        <>
                          {" · Last synced "}
                          {new Date(conn.last_synced_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                    </div>

                    {conn.sync_error && (
                      <div className="mt-2 text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                        {conn.sync_error}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {!conn.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(conn.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Star className="h-3 w-3" />
                          Make primary
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleRead(conn.id, conn.is_read_enabled)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                          conn.is_read_enabled
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {conn.is_read_enabled ? "✓ Blocking conflicts" : "Conflict blocking off"}
                      </button>
                      <button
                        onClick={() => handleDisconnect(conn.id, meta.name)}
                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect new */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Connect a new calendar
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleConnect("google")}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg group-hover:scale-110 transition-transform">
              <CalIcon className="h-6 w-6" />
            </div>
            <div className="text-sm font-semibold text-gray-800">Google Calendar</div>
            <div className="text-[11px] text-gray-400 -mt-2">One-click OAuth</div>
          </button>

          <button
            onClick={() => handleConnect("microsoft")}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border-2 border-gray-100 hover:border-indigo-300 hover:shadow-lg transition-all"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg group-hover:scale-110 transition-transform">
              <CalIcon className="h-6 w-6" />
            </div>
            <div className="text-sm font-semibold text-gray-800">Outlook / Microsoft</div>
            <div className="text-[11px] text-gray-400 -mt-2">One-click OAuth</div>
          </button>

          <button
            onClick={() => setShowAppleModal(true)}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border-2 border-gray-100 hover:border-slate-400 hover:shadow-lg transition-all"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-zinc-900 text-white shadow-lg group-hover:scale-110 transition-transform">
              <Apple className="h-6 w-6" />
            </div>
            <div className="text-sm font-semibold text-gray-800">Apple iCloud</div>
            <div className="text-[11px] text-gray-400 -mt-2">App-specific password</div>
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-2">How calendar sync works</h3>
        <ul className="space-y-1.5 text-xs text-gray-600">
          <li className="flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Primary calendar</strong> is where new Bloom bookings get created. You can only have one — pick the calendar you live in most.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Conflict blocking</strong> reads events from each connected calendar (every 15 minutes) and blocks Bloom slots that overlap. So a dentist appointment in your personal calendar prevents double-booking.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Multi-account</strong> — connect as many Google/Outlook accounts as you want. Each one can have conflict blocking on, but only one is the primary write target.</span>
          </li>
        </ul>
      </div>

      {/* Apple iCloud modal */}
      {showAppleModal && (
        <AppleModal onClose={() => setShowAppleModal(false)} onSuccess={() => {
          setShowAppleModal(false);
          toast.success("Apple Calendar connected!");
          fetchConnections();
        }} />
      )}
    </div>
  );
}

// ─── Apple iCloud modal with walkthrough ───

function AppleModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [appleId, setAppleId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch("/api/calendar/icloud/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apple_id: appleId, app_password: password }),
    });
    if (res.ok) {
      onSuccess();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Connection failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-zinc-900 text-white">
              <Apple className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-bold text-gray-800">Connect Apple iCloud</div>
              <div className="text-[11px] text-gray-400">Step {step} of 2</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
              <strong>Why an app-specific password?</strong> Apple doesn&apos;t have a public calendar API, so we use CalDAV — a standard protocol. You&apos;ll need to generate a one-time password from Apple instead of using your regular Apple ID password.
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Generate the password:</h3>
              <ol className="space-y-2.5 text-sm text-gray-600">
                <li className="flex gap-2.5">
                  <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">1</span>
                  <span>Open <a href="https://appleid.apple.com/account/manage" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline font-medium inline-flex items-center gap-0.5">appleid.apple.com<ExternalLink className="h-3 w-3" /></a> in a new tab</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">2</span>
                  <span>Sign in with your Apple ID</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">3</span>
                  <span>Scroll to <strong>Sign-In and Security</strong> → <strong>App-Specific Passwords</strong></span>
                </li>
                <li className="flex gap-2.5">
                  <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">4</span>
                  <span>Click <strong>Generate Password</strong> (or the + button)</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">5</span>
                  <span>Name it &quot;Bloom&quot; and copy the password (looks like <code className="text-[11px] bg-gray-100 px-1 py-0.5 rounded">abcd-efgh-ijkl-mnop</code>)</span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all"
            >
              I have my password, continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Apple ID email</label>
                <input
                  type="email"
                  value={appleId}
                  onChange={(e) => setAppleId(e.target.value)}
                  placeholder="you@icloud.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">App-specific password</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="abcd-efgh-ijkl-mnop"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none"
                />
                <p className="text-[11px] text-gray-400">
                  Stored encrypted. Used only to sync your calendar.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !appleId || !password}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Connecting…" : "Connect iCloud"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading…</div>}>
      <IntegrationsContent />
    </Suspense>
  );
}
