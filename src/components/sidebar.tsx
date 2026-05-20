"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  LayoutDashboard,
  UtensilsCrossed,
  BarChart3,
  Target,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  ClipboardList,
  BookOpen,
  Dumbbell,
  Calendar,
  Activity,
  TrendingUp,
  Shield,
  FileText,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import type { UserRole } from "@/types/database";
import { es } from "@/lib/i18n";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  client: [
    { href: "/client/dashboard", label: es.sidebar.nav.dashboard, icon: LayoutDashboard },
    { href: "/client/meals", label: es.sidebar.nav.meals, icon: UtensilsCrossed },
    { href: "/client/routines", label: es.sidebar.nav.routines, icon: Dumbbell },
    { href: "/client/messages", label: es.sidebar.nav.messages, icon: MessageCircle },
    { href: "/client/goals", label: es.sidebar.nav.goals, icon: Target },
    { href: "/client/appointments", label: es.sidebar.nav.appointments, icon: Calendar },
    { href: "/client/progress", label: es.sidebar.nav.progress, icon: Activity },
    { href: "/client/settings", label: es.sidebar.nav.settings, icon: Settings },
  ],
  nutritionist: [
    { href: "/nutritionist/dashboard", label: es.sidebar.nav.dashboard, icon: LayoutDashboard },
    { href: "/nutritionist/clients", label: es.sidebar.nav.clients, icon: Users },
    { href: "/nutritionist/meal-plans", label: es.sidebar.nav.mealPlans, icon: ClipboardList },
    { href: "/nutritionist/recipes", label: es.sidebar.nav.recipes, icon: BookOpen },
    { href: "/nutritionist/messages", label: es.sidebar.nav.messages, icon: MessageCircle },
    { href: "/nutritionist/appointments", label: es.sidebar.nav.appointments, icon: Calendar },
    { href: "/nutritionist/analytics", label: es.sidebar.nav.analytics, icon: TrendingUp },
    { href: "/nutritionist/settings", label: es.sidebar.nav.settings, icon: Settings },
  ],
  trainer: [
    { href: "/trainer/dashboard", label: es.sidebar.nav.dashboard, icon: LayoutDashboard },
    { href: "/trainer/clients", label: es.sidebar.nav.clients, icon: Users },
    { href: "/trainer/routines", label: es.sidebar.nav.routines, icon: ClipboardList },
    { href: "/trainer/exercises", label: es.sidebar.nav.exercises, icon: Dumbbell },
    { href: "/trainer/messages", label: es.sidebar.nav.messages, icon: MessageCircle },
    { href: "/trainer/appointments", label: es.sidebar.nav.appointments, icon: Calendar },
    { href: "/trainer/progress", label: es.sidebar.nav.progress, icon: Activity },
    { href: "/trainer/reports", label: es.sidebar.nav.analytics, icon: TrendingUp },
    { href: "/trainer/settings", label: es.sidebar.nav.settings, icon: Settings },
  ],
  admin: [
    { href: "/admin/dashboard", label: es.sidebar.nav.dashboard, icon: LayoutDashboard },
    { href: "/admin/users", label: es.sidebar.nav.users, icon: Users },
    { href: "/admin/content", label: es.sidebar.nav.content, icon: FileText },
    { href: "/admin/analytics", label: es.sidebar.nav.analytics, icon: TrendingUp },
    { href: "/admin/settings", label: es.sidebar.nav.settings, icon: Settings },
  ],
};

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = roleNavItems[role];
  const t = es.sidebar;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background lg:hidden"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border/50 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">{es.app.name}</span>
        </div>

        {/* Role badge */}
        <div className="border-b border-border/50 px-6 py-2">
          <span className="inline-flex items-center rounded-full border border-border bg-sidebar-muted/10 px-2.5 py-0.5 text-xs font-medium capitalize text-sidebar-muted">
            {role === "client" && es.role.client}
            {role === "nutritionist" && es.role.nutritionist}
            {role === "trainer" && es.role.trainer}
            {role === "admin" && es.role.admin}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-sidebar-accent text-white" : "text-sidebar-muted hover:bg-sidebar-muted/10 hover:text-sidebar-foreground"}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-sidebar-muted">{t.theme}</span>
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-muted/10 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {t.signOut}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}