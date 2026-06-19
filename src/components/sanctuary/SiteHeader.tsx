import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";

const nav = [
  { to: "/confess", label: "Confession" },
  { to: "/prayer", label: "Prayer" },
  { to: "/giving", label: "Giving" },
  { to: "/lookup", label: "Check Status" },
] as const;


export function SiteHeader() {
  return (
    <header className="border-b border-border/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <Flame
            aria-hidden
            className="h-6 w-6 text-gold flicker drop-shadow-[0_0_8px_rgba(212,175,55,0.45)]"
          />
          <span className="font-serif text-xl tracking-wide text-ivory">
            The <span className="gold-text">Throne Room</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              activeProps={{ className: "text-ivory bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className="ml-1 rounded-md border border-border/60 px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-gold/40 hover:text-ivory"
          >
            Stewards
          </Link>
        </nav>
      </div>
    </header>
  );
}
