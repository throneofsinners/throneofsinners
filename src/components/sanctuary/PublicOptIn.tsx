import { useState } from "react";

type Props = {
  type: "confession" | "testimony" | "prayer" | "partner_request";
};

export function PublicOptIn({ type }: Props) {
  const [opt, setOpt] = useState(false);
  const label =
    type === "testimony"
      ? "I'd like my testimony to be considered for public display"
      : type === "confession"
      ? "I'd like my confession to be considered for public display (anonymously)"
      : type === "partner_request"
      ? "I'd like my partner request shared publicly so a willing partner can respond"
      : "I'd like this request shared on the public prayer wall";

  return (
    <fieldset className="rounded-md border border-gold/20 bg-card/40 p-4">
      <legend className="px-2 text-xs uppercase tracking-[0.2em] text-gold/80">
        Public display
      </legend>
      <label className="flex items-start gap-3 text-sm text-ivory">
        <input
          type="checkbox"
          name="display_publicly"
          checked={opt}
          onChange={(e) => setOpt(e.target.checked)}
          className="mt-1 accent-[oklch(0.78_0.13_86)]"
        />
        <span>
          <span className="font-medium">{label}</span>
          <span className="block text-muted-foreground">
            A pastor will review and edit a short excerpt before anything appears
            publicly. Your full message is never shown.
          </span>
        </span>
      </label>
      {opt && (
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="public_title" className="block text-xs uppercase tracking-wide text-muted-foreground">
              Optional public title
            </label>
            <input
              id="public_title"
              name="public_title"
              maxLength={120}
              placeholder="A short headline pastors may use"
              className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          <div>
            <label htmlFor="public_excerpt" className="block text-xs uppercase tracking-wide text-muted-foreground">
              Optional excerpt you'd like considered
            </label>
            <textarea
              id="public_excerpt"
              name="public_excerpt"
              maxLength={600}
              rows={3}
              placeholder="The line or two of your story you wouldn't mind others reading."
              className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
        </div>
      )}
    </fieldset>
  );
}
