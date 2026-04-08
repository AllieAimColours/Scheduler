"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Provider } from "@/types/database";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  provider: Provider;
  userEmail?: string;
}

export function AppSidebar({ provider, userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

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

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
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
            <span className="text-sm font-semibold leading-tight tracking-tight text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">
              {provider.business_name}
            </span>
            <span className="text-xs text-muted-foreground">
              Manage your business
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="rounded-lg transition-all duration-150"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-3" />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent transition-colors" />}
          >
            <div className="flex w-full items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={provider.logo_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left min-w-0">
                <span className="text-sm font-medium truncate w-full">
                  {provider.business_name}
                </span>
                {userEmail && (
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {userEmail}
                  </span>
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
