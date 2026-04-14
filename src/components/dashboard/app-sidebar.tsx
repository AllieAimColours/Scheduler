"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  LayoutList,
  Clock,
  Users,
  Link as LinkIcon,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  Wand2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { PeonyMark } from "@/components/peony-mark";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Your Page", href: "/your-page", icon: Wand2, accent: true },
  { title: "Client View", href: "/preview", icon: Eye },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Bookings", href: "/bookings", icon: BookOpen },
  { title: "Services", href: "/services", icon: LayoutList },
  { title: "Availability", href: "/availability", icon: Clock },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "Integrations", href: "/integrations", icon: LinkIcon },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "Settings", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  provider: {
    business_name: string;
    logo_url: string | null;
    slug: string;
  };
  userEmail?: string;
}

export function AppSidebar({ provider, userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Focus mode: collapse the sidebar to a thin strip on routes that need
  // maximum canvas space (Your Page builder).
  const focusMode = pathname.startsWith("/your-page");
  const [focusExpanded, setFocusExpanded] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = provider.business_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const renderNav = (onNavigate?: () => void) => (
    <>
      {/* Header */}
      <div className="px-5 py-5">
        <a
          href="/dashboard"
          className="flex items-center gap-3 group"
          onClick={onNavigate}
        >
          {provider.logo_url ? (
            <img
              src={provider.logo_url}
              alt={provider.business_name}
              className="h-10 w-10 rounded-xl object-cover shadow-md ring-2 ring-white/50"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-50 to-rose-100 shadow-md ring-2 ring-white/20">
              <PeonyMark size={32} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight tracking-tight text-gray-800 group-hover:text-purple-700 transition-colors">
              {provider.business_name}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              /book/{provider.slug}
            </span>
          </div>
        </a>
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          // Add separator before Client View
          const showSeparator = item.accent && index > 0;

          return (
            <div key={item.href}>
              {showSeparator && (
                <div className="my-2 mx-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              )}
              <a
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  item.accent && !isActive
                    ? "text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 font-medium"
                    : isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md shadow-purple-200/50"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50/80"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-white" : ""}`} />
                <span>{item.title}</span>
                {item.accent && !isActive && (
                  <Sparkles className="ml-auto h-3.5 w-3.5 text-pink-500 animate-pulse" />
                )}
              </a>
              {showSeparator && (
                <div className="my-2 mx-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4">
        <div className="mx-1 mb-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white text-xs font-bold shrink-0 ring-2 ring-purple-100">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-700 truncate">
              {provider.business_name}
            </span>
            {userEmail && (
              <span className="text-[11px] text-gray-400 truncate">
                {userEmail}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50/80 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-pink-50 to-rose-100">
            <PeonyMark size={22} />
          </div>
          <span className="text-sm font-bold text-gray-800 truncate">
            {provider.business_name}
          </span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white/95 backdrop-blur-md shadow-2xl flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 z-10"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
            {renderNav(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      {/* Desktop sidebar — collapses to a thin icon strip in focus mode */}
      {focusMode && !focusExpanded ? (
        <aside className="hidden md:flex w-14 flex-col items-center bg-white border-r border-gray-100 sticky top-0 h-screen shrink-0 py-4 gap-2">
          <button
            onClick={() => setFocusExpanded(true)}
            className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-all"
            title="Expand menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <a
            href="/dashboard"
            className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-all"
            title="Dashboard"
          >
            <LayoutDashboard className="h-5 w-5" />
          </a>
          <div className="mx-2 h-px w-6 bg-gray-100" />
          {provider.logo_url ? (
            <img
              src={provider.logo_url}
              alt={provider.business_name}
              className="h-9 w-9 rounded-xl object-cover shadow-md mt-auto"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-50 to-rose-100 shadow-md mt-auto">
              <PeonyMark size={28} />
            </div>
          )}
        </aside>
      ) : (
        <aside className="hidden md:flex w-64 flex-col bg-gradient-to-b from-white via-gray-50/30 to-purple-50/20 min-h-screen shrink-0 sticky top-0 h-screen border-r border-gray-100">
          {focusMode && (
            <button
              onClick={() => setFocusExpanded(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-all z-10"
              title="Collapse menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {renderNav()}
        </aside>
      )}
    </>
  );
}
