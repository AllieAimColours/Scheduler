import { Sparkles, Check, Zap, Calendar as CalIcon, Shield } from "lucide-react";

const CALENDARS = [
  {
    name: "Google Calendar",
    description: "Two-way sync with your Google Calendar",
    accent: "from-blue-500 via-cyan-500 to-teal-500",
    glow: "shadow-blue-500/30",
    bg: "from-blue-500/10 to-cyan-500/10",
    letter: "G",
  },
  {
    name: "Microsoft Outlook",
    description: "Connect Outlook for unified scheduling",
    accent: "from-indigo-500 via-blue-500 to-sky-500",
    glow: "shadow-indigo-500/30",
    bg: "from-indigo-500/10 to-blue-500/10",
    letter: "O",
  },
  {
    name: "Apple Calendar",
    description: "Sync via CalDAV with iCloud",
    accent: "from-slate-600 via-gray-700 to-zinc-900",
    glow: "shadow-slate-500/30",
    bg: "from-slate-500/10 to-gray-500/10",
    letter: "",
  },
  {
    name: "Proton Calendar",
    description: "End-to-end encrypted calendar sync",
    accent: "from-violet-600 via-purple-600 to-fuchsia-600",
    glow: "shadow-violet-500/30",
    bg: "from-violet-500/10 to-purple-500/10",
    letter: "P",
  },
];

const PERKS = [
  {
    icon: Zap,
    title: "Real-time sync",
    description: "Updates flow both ways instantly. Book a client, block your calendar — all in sync.",
  },
  {
    icon: Shield,
    title: "Privacy first",
    description: "We only read busy/free times. Event details stay yours.",
  },
  {
    icon: CalIcon,
    title: "No double-bookings",
    description: "Personal events automatically block your booking availability.",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-10 max-w-5xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 p-10 md:p-14 border border-white shadow-sm">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-violet-400/20 to-pink-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-amber-400/20 to-pink-400/20 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-xs font-medium text-violet-700 uppercase tracking-wider">Coming soon</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3">
            Connect your calendars
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            One source of truth for every booking. We&apos;re wiring up native integrations
            with the calendars you already use.
          </p>
        </div>
      </div>

      {/* Perks */}
      <div className="grid md:grid-cols-3 gap-4">
        {PERKS.map((perk) => (
          <div
            key={perk.title}
            className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-4 group-hover:scale-110 transition-transform duration-300">
              <perk.icon className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-display text-xl text-gray-800 mb-1.5">{perk.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{perk.description}</p>
          </div>
        ))}
      </div>

      {/* Calendar cards */}
      <div>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-3xl text-gray-800">Available calendars</h2>
            <p className="text-sm text-gray-500 mt-1">All four are launching together — early access opens soon.</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {CALENDARS.map((cal) => (
            <div
              key={cal.name}
              className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cal.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative p-7">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${cal.accent} text-white text-2xl font-bold shadow-xl ${cal.glow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                  >
                    {cal.letter || <CalIcon className="h-7 w-7" />}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Soon</span>
                  </div>
                </div>

                <h3 className="font-display text-2xl text-gray-800 mb-1.5">{cal.name}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">{cal.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex -space-x-1">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <span>Two-way sync</span>
                  <span className="text-gray-300">·</span>
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Auto-block</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
