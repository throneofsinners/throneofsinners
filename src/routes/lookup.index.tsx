import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/sanctuary/PageShell";
import { isValidToken, normalizeToken } from "@/lib/token";

export const Route = createFileRoute("/lookup/")({
  head: () => ({
    meta: [
      { title: "Check Status — The Throne Room" },
      {
        name: "description",
        content:
          "Enter your sacred tracking code to read pastoral responses to your anonymous submission.",
      },
    ],
  }),
  component: LookupPage,
});

function LookupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = String(new FormData(e.currentTarget).get("token") ?? "");
    const token = normalizeToken(raw);
    if (!isValidToken(token)) {
      setError("That tracking code doesn't look right. It should look like THRONE-XXXX-XXXX-XXXX.");
      return;
    }
    navigate({ to: "/lookup/$token", params: { token } });
  }

  return (
    <PageShell
      eyebrow="Return to your message"
      title={<>Check the status.</>}
      subtitle="Enter the sacred tracking code you received when you submitted, to read any pastoral response."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-ivory">
            Tracking code
          </label>
          <input
            id="token"
            name="token"
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="THRONE-XXXX-XXXX-XXXX"
            className="mt-2 w-full rounded-md border border-border bg-input px-3 py-3 text-center font-serif text-xl uppercase tracking-[0.18em] text-ivory placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive-foreground">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="candle-glow inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 font-serif text-lg text-primary-foreground hover:scale-[1.01]"
        >
          Open the scroll
        </button>
      </form>
    </PageShell>
  );
}
