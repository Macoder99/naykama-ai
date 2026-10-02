"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronsUpDown, LogOut, Menu, Search, Settings, Shield, Sparkles, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { Avatar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { allNavItems, navGroups } from "./nav";
import { SessionProvider, type ClientUser } from "./session-context";
import { CommandPalette } from "./command-palette";

function Sidebar({ user, onNavigate }: { user: ClientUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo href="/dashboard" />
      </div>
      <div className="mx-3 mb-3 flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">
          {user.company.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.company}</p>
          <p className="text-xs text-muted-foreground">{user.plan} plan</p>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </div>
      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {navGroups.map((g) => (
          <div key={g.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{g.label}</p>
            {g.items.map((item) => {
              const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active ? "bg-brand-2/10 text-foreground" : "text-foreground/65 hover:bg-muted hover:text-foreground",
                  )}
                >
                  {active && <motion.span layoutId="nav-active" className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-brand" />}
                  <item.icon className={cn("h-[18px] w-[18px]", active && "text-brand-2 dark:text-violet-300")} />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
        {user.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/65 hover:bg-muted hover:text-foreground"
          >
            <Shield className="h-[18px] w-[18px]" /> Admin panel
          </Link>
        )}
      </nav>
      <div className="m-3 rounded-2xl bg-brand p-4 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4" /> AI usage
        </div>
        <p className="mt-1 text-xs text-white/80">9,412 of 15,000 conversations</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full w-[63%] rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}

function UserMenu({ user }: { user: ClientUser }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex cursor-pointer items-center gap-2 rounded-xl p-1 hover:bg-muted" aria-label="Account menu">
        <Avatar name={user.name} className="h-8 w-8" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <p className="mt-1 text-xs capitalize text-brand-2 dark:text-violet-300">{user.role}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted">
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button onClick={logout} className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-muted">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DashboardShell({ user, children }: { user: ClientUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();
  const current = allNavItems.find((i) => (i.href === "/dashboard" ? pathname === i.href : pathname.startsWith(i.href)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SessionProvider user={user}>
      <div className="flex min-h-dvh bg-muted/30">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card lg:block">
          <Sidebar user={user} />
        </aside>

        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute inset-y-0 left-0 w-72 border-r border-border bg-card"
              >
                <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 rounded-lg p-2 hover:bg-muted" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
                <Sidebar user={user} onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <header className="glass sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <p className="font-display font-semibold lg:hidden">{current?.label ?? "Dashboard"}</p>
            <button
              onClick={() => setPaletteOpen(true)}
              className="ml-auto flex h-9 w-full max-w-xs cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm text-muted-foreground transition hover:border-ring/50 sm:ml-0 lg:max-w-sm"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search or ask AI…</span>
              <kbd className="ml-auto hidden rounded-md border border-border px-1.5 text-[10px] font-medium sm:inline">Ctrl K</kbd>
            </button>
            <div className="flex items-center gap-1 sm:ml-auto">
              <ThemeToggle />
              <Link href="/dashboard/notifications" className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-foreground/70 hover:bg-muted" aria-label="Notifications">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
              </Link>
              <UserMenu user={user} />
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </main>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </SessionProvider>
  );
}
