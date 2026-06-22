import { Link, useRouterState } from "@tanstack/react-router";
import { Crown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";


const NAV = [
  { to: "/sanctuary", label: "Sanctuary" },
  { to: "/voices", label: "Voices" },
  { to: "/pastors", label: "Pastors" },
  { to: "/confess", label: "Confess" },
  { to: "/lookup", label: "My Scroll" },
  { to: "/giving", label: "Giving" },
] as const;

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={
        isHome
          ? "absolute inset-x-0 top-0 z-30"
          : "sticky top-0 z-30 border-b border-gold/15 bg-background/85 backdrop-blur"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">

        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold bg-background/40 candle-flicker">
            <Crown aria-hidden className="h-4 w-4 text-gold" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg text-ivory">THRONE OF SINNERS</span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Sanctuary · Grace · Restoration
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {signedIn ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-gold bg-gradient-to-b from-gold/20 to-bronze/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-gold transition-colors hover:from-gold/30 hover:to-bronze/20"
            >
              Pastoral Suite
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-md border border-gold/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ivory/80 transition-colors hover:border-gold hover:text-gold"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/40 text-gold lg:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="mx-4 mb-4 rounded-lg border border-gold/20 bg-card/95 p-4 backdrop-blur">
            <nav aria-label="Mobile" className="flex flex-col gap-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded px-3 py-2 text-ivory/80 hover:bg-gold/10 hover:text-gold"
                  activeProps={{ className: "bg-gold/10 text-gold" }}
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-gold/15" />
              {signedIn ? (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded px-3 py-2 text-gold hover:bg-gold/10"
                >
                  Pastoral Suite
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="rounded px-3 py-2 text-gold hover:bg-gold/10"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
