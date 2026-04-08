"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Scissors,
  Clock,
  Users,
  Link as LinkIcon,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Provider } from "@/types/database";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Bookings", href: "/bookings", icon: BookOpen },
  { title: "Services", href: "/services", icon: Scissors },
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
  };
  userEmail?: string;
}

function NavLink({
  href,
  isActive,
  onClick,
  children,
}: {
  href: string;
  isActive: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? "bg-purple-50 text-purple-700 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {children}
    </a>
  );
}

export function AppSidebar({ provider, userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="px-5 py-5 border-b">
        <a href="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          {provider.logo_url ? (
            <img
              src={provider.logo_url}
              alt={provider.business_name}
              className="h-9 w-9 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight tracking-tight">
              {provider.business_name}
            </span>
            <span className="text-xs text-gray-500">Manage your business</span>
          </div>
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={isActive}
              onClick={onNavigate}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs font-medium shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {provider.business_name}
            </span>
            {userEmail && (
              <span className="text-xs text-gray-500 truncate">
                {userEmail}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-white border-b">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold truncate">
          {provider.business_name}
        </span>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            {renderNav(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white min-h-screen shrink-0 sticky top-0 h-screen">
        {renderNav()}
      </aside>
    </>
  );
}
