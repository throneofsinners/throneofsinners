import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function TokenDisplay({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="altar-card candle-glow p-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Your sacred tracking code
      </p>
      <p
        className="mt-3 select-all break-all font-serif text-2xl sm:text-3xl gold-text"
        aria-label={`Your tracking code is ${token}`}
      >
        {token}
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-gold/40 px-4 py-2 text-sm text-ivory transition-colors hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {copied ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy code"}
      </button>
      <p className="mt-5 text-xs text-muted-foreground">
        Keep this somewhere safe. It is the only way to view pastoral responses
        without creating an account.
      </p>
    </div>
  );
}
