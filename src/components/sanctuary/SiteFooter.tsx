export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-gold/15">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <p className="font-serif text-lg text-ivory">The Throne Room</p>
        <p className="mt-2 font-serif italic text-sm text-muted-foreground">
          “Let us then approach the throne of grace with confidence.” — Hebrews 4:16
        </p>
        <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">
          © {new Date().getFullYear()} The Throne Room · A pastoral sanctuary
        </p>
      </div>
    </footer>
  );
}
