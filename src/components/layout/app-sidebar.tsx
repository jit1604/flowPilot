import {
  CalendarDays,
  Focus,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Map,
  NotebookText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/focus", label: "Focus", icon: Focus },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/projects", label: "Projects", icon: Map },
  { href: "/planner", label: "Daily planner", icon: CalendarDays },
  { href: "/review", label: "Review", icon: NotebookText },
] as const;

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside
      className={cn(
        "relative z-10 flex h-screen w-[242px] shrink-0 flex-col border-r border-sidebar-border",
        "bg-sidebar/85 py-8 pl-[18px] pr-4 backdrop-blur-2xl",
        "supports-[backdrop-filter]:bg-sidebar/55",
      )}
    >
      <Link
        href="/dashboard"
        className="group mb-10 flex items-center gap-3 rounded-2xl px-2 py-1.5 outline-none ring-sidebar-ring transition hover:bg-sidebar-accent/40 focus-visible:ring-2"
      >
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl text-primary-foreground",
            "bg-gradient-to-br from-primary via-violet-600 to-purple-700",
            "shadow-lg shadow-primary/30 ring-1 ring-white/25",
            "transition group-hover:shadow-xl group-hover:shadow-primary/35",
          )}
        >
          <Sparkles className="size-[1.15rem]" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <span className="fp-title block truncate text-lg font-semibold leading-tight text-foreground">
            Flow<span className="fp-accent-word">Pilot</span>
          </span>
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Your flow, routed
          </span>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/focus" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group/nav relative flex items-center gap-3 rounded-xl py-2.5 pr-3 pl-3 text-[0.9375rem] font-medium outline-none ring-sidebar-ring transition-all duration-200 focus-visible:ring-2",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-primary/5"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full transition-all",
                  active ? "bg-primary opacity-100" : "bg-primary/0 opacity-0",
                )}
                aria-hidden
              />
              <Icon
                className={cn(
                  "relative size-[1.125rem] shrink-0 transition-transform",
                  active
                    ? "text-primary"
                    : "opacity-75 group-hover/nav:opacity-100",
                )}
                strokeWidth={active ? 2.25 : 2}
                aria-hidden
              />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <p className="px-3 text-[0.72rem] leading-relaxed text-muted-foreground/90">
          Local-first capture. Planner runs on-device heuristics—no API keys.
        </p>
        <div className="mx-1 flex items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent/30 px-3 py-2">
          <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
            Mode
          </span>
          <span className="rounded-lg bg-primary/15 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
            Private
          </span>
        </div>
      </div>
    </aside>
  );
}
