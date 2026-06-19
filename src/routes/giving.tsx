import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/sanctuary/PageShell";
import { Heart, Gift, Repeat, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/giving")({
  head: () => ({
    meta: [
      { title: "Giving & Tithes — The Throne Room" },
      {
        name: "description",
        content:
          "Honor God with your tithes and offerings. Give as the Spirit leads — your gift supports pastoral care, prayer, and the work of restoration.",
      },
      { property: "og:title", content: "Giving & Tithes — The Throne Room" },
      {
        property: "og:description",
        content:
          "Bring your tithes and offerings to the storehouse. Every gift fuels pastoral care and restoration.",
      },
    ],
  }),
  component: GivingPage,
});

const PRESETS = [10, 25, 50, 100, 250, 500] as const;

const METHODS = [
  {
    label: "PayPal",
    value: "throneofsinners@gmail.com",
    href: "https://www.paypal.com/donate?business=throneofsinners@gmail.com&item_name=Tithes+%26+Offerings&currency_code=USD",
    note: "Send as Friends & Family to avoid fees.",
  },
  {
    label: "Cash App",
    value: "$ThroneOfSinners",
    href: "https://cash.app/$ThroneOfSinners",
    note: "Note your gift as 'Tithe' or 'Offering'.",
  },
  {
    label: "Zelle",
    value: "throneofsinners@gmail.com",
    href: null,
    note: "Use your bank's Zelle directory.",
  },
] as const;

function GivingPage() {
  const [amount, setAmount] = useState<number | "">(50);
  const [recurring, setRecurring] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <PageShell
      eyebrow="Tithes & Offerings"
      title={<>Give as worship.</>}
      subtitle="Bring the whole tithe into the storehouse — that there may be food in My house. Test Me in this, says the LORD Almighty. — Malachi 3:10"
    >
      <div className="space-y-8">
        <section className="altar-card p-6">
          <div className="flex items-start gap-3">
            <Heart className="mt-1 h-5 w-5 text-gold" aria-hidden />
            <div>
              <h2 className="font-serif text-xl text-ivory">Where your gift goes</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Pastoral care &amp; crisis response for those who confess and pray here</li>
                <li>• Quiet support for members in spiritual or material need</li>
                <li>• Hosting, security, and the prayer team's resources</li>
                <li>• Outreach &amp; restoration ministry beyond these walls</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="altar-card p-6">
          <h2 className="font-serif text-xl text-ivory">Choose an amount</h2>
          <div className="gold-rule my-3" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`rounded-md border px-3 py-2 font-serif text-base transition-colors ${
                  amount === v
                    ? "border-gold/70 bg-gold/15 text-ivory"
                    : "border-border bg-background text-muted-foreground hover:border-gold/40 hover:text-ivory"
                }`}
              >
                ${v}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-serif text-2xl text-gold">$</span>
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
              className="w-32 rounded-md border border-border bg-background px-3 py-2 font-serif text-2xl text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
              aria-label="Gift amount"
            />
            <label className="ml-auto flex items-center gap-2 text-sm text-ivory">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
              />
              <Repeat className="h-4 w-4 text-gold" aria-hidden />
              Make this a monthly gift
            </label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Select your amount, then choose a giving method below. Your selection
            will be remembered when you open PayPal or Cash App.
          </p>
        </section>

        <section className="altar-card p-6">
          <div className="flex items-start gap-3">
            <Gift className="mt-1 h-5 w-5 text-gold" aria-hidden />
            <h2 className="font-serif text-xl text-ivory">Ways to give</h2>
          </div>
          <div className="gold-rule my-3" />
          <ul className="space-y-4">
            {METHODS.map((m) => {
              const url =
                m.href && typeof amount === "number"
                  ? m.label === "PayPal"
                    ? `${m.href}&amount=${amount}`
                    : m.label === "Cash App"
                      ? `${m.href}/${amount}`
                      : m.href
                  : m.href;
              return (
                <li
                  key={m.label}
                  className="flex flex-col gap-2 rounded-md border border-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-serif text-lg text-ivory">{m.label}</p>
                    <p className="font-mono text-sm text-gold">{m.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copy(m.value)}
                      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-ivory hover:border-gold/40 hover:bg-gold/10"
                    >
                      {copied === m.value ? <Check className="h-3.5 w-3.5 text-gold" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === m.value ? "Copied" : "Copy"}
                    </button>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="candle-glow inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                      >
                        Give {typeof amount === "number" ? `$${amount}` : ""}
                        {recurring ? " monthly" : ""}
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="altar-card p-6">
          <h2 className="font-serif text-xl text-ivory">A word on giving</h2>
          <div className="gold-rule my-3" />
          <p className="font-serif text-base leading-relaxed text-ivory/90">
            "Each of you should give what you have decided in your heart to give,
            not reluctantly or under compulsion, for God loves a cheerful giver."
          </p>
          <p className="mt-2 text-sm text-gold">— 2 Corinthians 9:7</p>
          <p className="mt-4 text-sm text-muted-foreground">
            We never sell your information and we never share donor lists. If you
            need a giving record for tax purposes, contact the stewards and we
            will provide a written acknowledgment.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
