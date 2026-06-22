import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/sanctuary/PageShell";
import { SubmissionForm } from "@/components/sanctuary/SubmissionForm";
import { UsersRound, ShieldCheck, Flame } from "lucide-react";
import bg from "@/assets/bg-restoration.jpg";

export const Route = createFileRoute("/restoration")({
  head: () => ({
    meta: [
      { title: "Restoration Chambers — The Throne Room" },
      {
        name: "description",
        content:
          "Pastor-led restoration circles for healing, recovery, marriage and faithfulness. Every chamber is shepherded — never unsupervised.",
      },
      { property: "og:title", content: "Restoration Chambers — The Throne Room" },
      {
        property: "og:description",
        content:
          "Small, shepherded circles where the wounded walk together toward wholeness.",
      },
    ],
  }),
  component: RestorationPage,
});

const CHAMBERS = [
  {
    name: "Beauty for Ashes",
    focus: "Grief, loss & trauma",
    cadence: "Weekly · Tuesday evenings",
  },
  {
    name: "The Narrow Path",
    focus: "Addiction & habitual sin",
    cadence: "Weekly · Thursday evenings",
  },
  {
    name: "Cana",
    focus: "Marriage restoration",
    cadence: "Fortnightly · Sunday evenings",
  },
  {
    name: "Returning",
    focus: "Faith deconstruction & doubt",
    cadence: "Weekly · Monday evenings",
  },
];

const CATEGORIES = [
  { value: "grief", label: "Beauty for Ashes — grief & trauma" },
  { value: "addiction", label: "The Narrow Path — addiction & recovery" },
  { value: "marriage", label: "Cana — marriage restoration" },
  { value: "doubt", label: "Returning — doubt & deconstruction" },
  { value: "other", label: "I'm not sure yet" },
];

function RestorationPage() {
  return (
    <PageShell
      background={bg}
      eyebrow="Restoration Chambers"
      title={<>Walk it together.</>}
      subtitle="Small, shepherded circles — never anonymous public forums. Every chamber is held by a pastor and bound by covenant."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {CHAMBERS.map((c) => (
          <article
            key={c.name}
            className="altar-card p-5"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gold bg-background/40 text-gold">
                <UsersRound aria-hidden className="h-4 w-4" />
              </span>
              <h2 className="font-serif text-xl text-ivory">{c.name}</h2>
            </div>
            <p className="mt-3 text-sm text-ivory/85">{c.focus}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gold/80">
              {c.cadence}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 flex items-start gap-3 rounded-lg border border-gold/20 bg-card/70 p-5 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
        <p>
          Each chamber is supervised by a pastor or trained steward. Membership
          is by application and covenant — the sanctuary protects every soul in
          the circle.
        </p>
      </div>

      <div className="mt-12 border-t border-gold/15 pt-10">
        <div className="mb-6 flex items-center gap-2">
          <Flame className="h-4 w-4 text-gold candle-flicker" aria-hidden />
          <h2 className="font-serif text-2xl text-ivory">
            Apply to a chamber
          </h2>
        </div>
        <SubmissionForm
          type="prayer"
          categories={CATEGORIES}
          intro="Tell us a little about the season you're in. A steward will reach out within a few days."
          contentLabel="Why are you drawn to this chamber?"
          contentPlaceholder="I've been carrying…"
          submitLabel="Submit application"
        />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already applied?{" "}
          <Link to="/lookup" className="text-gold hover:underline">
            Open your scroll
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
