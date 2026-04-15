"use client";

import { useAuth } from "@/providers/AuthProvider";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navLinks } from "./Sidebar";

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm text-zinc-500 md:hidden">Lead Intelligence</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[200px] truncate text-sm text-zinc-400 sm:inline">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <nav className="relative z-10 flex h-full w-64 flex-col gap-1 border-r border-zinc-800 bg-zinc-950 p-3 shadow-xl">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = path === href || (href !== "/dashboard" && path.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    active ? "bg-violet-600/20 text-violet-200" : "text-zinc-400 hover:bg-zinc-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
