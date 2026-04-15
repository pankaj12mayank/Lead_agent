"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  Settings,
  BarChart3,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

export const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/platforms", label: "Platforms", icon: Layers },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950/80 md:flex">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
        <Sparkles className="h-6 w-6 text-violet-400" />
        <div>
          <div className="text-sm font-semibold tracking-tight text-zinc-100">Lead Intelligence</div>
          <div className="text-xs text-zinc-500">SaaS Console</div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-violet-600/15 text-violet-200 ring-1 ring-violet-500/30"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
