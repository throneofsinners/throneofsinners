import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, HandHeart, ScrollText, KeyRound } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Throne Room — Confession, prayer, and pastoral care" },
      {
        name: "description",
        content:
          "Step into a sacred sanctuary. Confess, request prayer, and receive pastoral care — anonymously if you wish.",
      },
      { property: "og:title", content: "The Throne Room" },
      {
        property: "og:description",
        content:
          "A confidential digital sanctuary for confession, prayer, and pastoral care.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        <Flame
          aria-hidden
          className="mx-auto h-12 w-12 text-gold flicker drop-shadow-[0_0_24px_rgba(212,175,55,0.55)]"
        />
        <p className="mt-6 text-xs uppercase tracking-[0.4em] text-gold/80">
          Enter the sanctuary
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-serif text-5xl leading-[1.05] text-ivory sm:text-7xl">
          <span className="gold-text">Approach the throne</span>
          <br />
          of grace.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          A confidential place to confess, to ask for prayer, and to be heard
          by people who will care for you with reverence. Anonymously, if you
          choose.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/confess"
            className="candle-glow inline-flex w-full items-center justify-center rounded-md bg-primary px-7 py-3 font-serif text-lg text-primary-foreground transition-transform hover:scale-[1.02] sm:w-auto"
          >
            Make a Confession
          </Link>
          <Link
            to="/prayer"
            className="inline-flex w-full items-center justify-center rounded-md border border-gold/40 bg-secondary/60 px-7 py-3 font-serif text-lg text-ivory transition-colors hover:bg-gold/10 sm:w-auto"
          >
            Request Prayer
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Encrypted · Anonymous by default · Pastor-reviewed
        </p>
      </section>

      <div className="gold-rule mx-auto max-w-md" />

      {/* Three pillars */}
      <section className="grid gap-6 py-20 sm:grid-cols-3" aria-label="What you can do here">
        <Pillar
          icon={<ScrollText className="h-6 w-6" aria-hidden />}
          title="Confess in confidence"
          body="Lay it down. Confessions are read only by pastoral staff and may be made completely anonymously."
        />
        <Pillar
          icon={<HandHeart className="h-6 w-6" aria-hidden />}
          title="Be prayed over"
          body="Submit a prayer request and a trusted prayer team will carry it before the throne with you."
        />
        <Pillar
          icon={<KeyRound className="h-6 w-6" aria-hidden />}
          title="Return any time"
          body="Every anonymous submission receives a sacred tracking code. Use it to read pastoral responses — no account required."
        />
      </section>

      <div className="gold-rule mx-auto max-w-md" />

      {/* Scripture */}
      <section className="py-24 text-center" aria-label="Scripture">
        <p className="mx-auto max-w-2xl font-serif text-3xl italic text-ivory sm:text-4xl">
          “Come to me, all you who are weary and burdened, and I will give you
          rest.”
        </p>
        <p className="mt-4 text-sm text-muted-foreground">— Matthew 11:28</p>
      </section>

      {/* Status lookup CTA */}
      <section className="mx-auto mb-24 max-w-xl altar-card p-8 text-center">
        <h2 className="font-serif text-2xl text-ivory">
          Already have a tracking code?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Read pastoral responses to your anonymous submission.
        </p>
        <Link
          to="/lookup"
          className="mt-5 inline-flex items-center justify-center rounded-md border border-gold/40 px-5 py-2 text-sm text-ivory hover:bg-gold/10"
        >
          Check the status of a submission
        </Link>
      </section>
    </main>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="altar-card p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/30 bg-gold/5 text-gold">
        {icon}
      </div>
      <h3 className="mt-4 font-serif text-xl text-ivory">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
