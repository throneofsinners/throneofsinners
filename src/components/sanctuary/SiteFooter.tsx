import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/confess", label: "Confession" },
  { to: "/prayer", label: "Prayer Altar" },
  { to: "/lookup", label: "My Scroll" },
  { to: "/giving", label: "Giving" },
  { to: "/auth", label: "Sign in" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-gold/15">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <p className="font-serif text-lg text-ivory">The Throne Of Sinners</p>
        <p className="mt-2 font-serif italic text-sm text-muted-foreground">
          “Let us then approach the throne of sin with confidence.”
        </p>
        <nav
          aria-label="Footer"
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.22em] text-muted-foreground"
        >
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-gold">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">
          © {new Date().getFullYear()} THRONE OF SINNERS· A pastoral sanctuary
        </p>
      </div>
    </footer>
  );
}
