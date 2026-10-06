import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { routes } from "@/routes";
import { useHub } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

function RoleSwitch({ className }: { className?: string }) {
  const role = useHub((s) => s.role);
  const setRole = useHub((s) => s.setRole);
  const opts: { v: Role; l: string }[] = [
    { v: "klientin", l: "Elena" },
    { v: "coach", l: "Coach" },
  ];
  return (
    <div role="group" aria-label="Ansicht wählen" className={cn("inline-flex rounded-full bg-white/10 p-1", className)}>
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={role === o.v}
          onClick={() => setRole(o.v)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300",
            role === o.v ? "bg-emerald-300 text-blue-950" : "text-blue-100 hover:text-white",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function SavedIndicator({ className }: { className?: string }) {
  const lastSaved = useHub((s) => s.lastSaved);
  const text = lastSaved
    ? `Gespeichert ${new Date(lastSaved).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
    : "Automatisches Speichern aktiv";
  return (
    <p className={cn("flex items-center gap-1.5 text-xs text-blue-100", className)} aria-live="polite">
      <CheckCircle2 className="size-3.5 text-emerald-300" aria-hidden="true" />
      {text}
    </p>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const role = useHub((s) => s.role);
  const nav = routes.filter((r) => r.label && (!r.coachOnly || role === "coach"));

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Zum Inhalt springen
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-blue-950 px-5 py-6 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-emerald-300 text-lg font-bold text-blue-950" aria-hidden="true">
            E
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Elena</p>
            <p className="text-xs text-blue-100">Nutrition Coaching</p>
          </div>
        </div>
        <RoleSwitch className="mt-6 self-start" />
        <nav aria-label="Hauptnavigation" className="mt-8 flex flex-col gap-1">
          {nav.map((r) => {
            const Icon = r.icon!;
            return (
              <NavLink
                key={r.path}
                to={r.path}
                end={r.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-300",
                    isActive ? "bg-white text-blue-950" : "text-blue-100 hover:bg-white/10 hover:text-white",
                  )
                }
              >
                <Icon className="size-4.5" aria-hidden="true" />
                {r.label}
              </NavLink>
            );
          })}
        </nav>
        <SavedIndicator className="mt-auto" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-blue-950 px-4 py-3 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-emerald-300 text-sm font-bold text-blue-950" aria-hidden="true">
              E
            </div>
            <span className="text-sm font-bold">Elena · Coaching</span>
          </div>
          <RoleSwitch />
        </header>

        <main id="inhalt" className="flex flex-1 flex-col pb-24 lg:pb-0">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Mobile bottom nav */}
        <nav
          aria-label="Hauptnavigation mobil"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden"
        >
          <ul className="no-scrollbar flex overflow-x-auto px-2 py-1.5">
            {nav.map((r) => {
              const Icon = r.icon!;
              return (
                <li key={r.path} className="min-w-[4.5rem] flex-1">
                  <NavLink
                    to={r.path}
                    end={r.path === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-ring",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={cn("grid h-7 w-12 place-items-center rounded-full", isActive && "bg-emerald-100")}>
                          <Icon className="size-4.5" aria-hidden="true" />
                        </span>
                        {r.short}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <Toaster />
    </div>
  );
}

export default AppShell;
