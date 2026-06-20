import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold bg-background/40 candle-flicker">
            <Crown aria-hidden className="h-4 w-4 text-gold" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg text-ivory">The Throne Room</span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Sanctuary · Grace · Restoration
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"
        >
          <a href="#sanctuary" className="transition-colors hover:text-gold">Sanctuary</a>
          <a href="#chambers" className="transition-colors hover:text-gold">Chambers</a>
          <a href="#covenant" className="transition-colors hover:text-gold">Our Covenant</a>
        </nav>

        <Link
          to="/confess"
          className="inline-flex items-center justify-center rounded-md border border-gold bg-gradient-to-b from-gold/20 to-bronze/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-gold transition-colors hover:from-gold/30 hover:to-bronze/20"
        >
          Enter the Sanctuary
        </Link>
      </div>
    </header>
  );
}
