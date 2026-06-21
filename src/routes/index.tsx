import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Flame,
  ScrollText,
  HandHeart,
  MessagesSquare,
  BookOpenText,
  UsersRound,
  Lock,
  KeyRound,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Dust } from "@/components/sanctuary/Dust";
import heroImage from "@/assets/throne-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "The Throne Room — A Sacred Sanctuary for Confession, Prayer & Restoration",
      },
      {
        name: "description",
        content:
          "A confidential digital sanctuary where you can confess, request prayer, seek pastoral counsel, share testimony, and walk in supervised restoration.",
      },
      { property: "og:title", content: "The Throne Room" },
      {
        property: "og:description",
        content:
          "Enter holy ground. A confidential sanctuary for confession, prayer and pastoral care.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <Hero />
      <Chambers />
      <Covenant />
      <Invitation />
    </main>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section
      id="sanctuary"
      className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 pt-32 pb-24 text-center"
    >
      <img
        src={heroImage}
        alt=""
        aria-hidden
        width={1920}
        height={1280}
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70"
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 0%, oklch(0.13 0.012 260 / 0.55) 55%, oklch(0.08 0.008 260 / 0.95) 100%)",
        }}
      />
      {/* Heavenly light shaft */}
      <div
        aria-hidden
        className="heavenly-glow absolute -top-20 left-1/2 -z-10 h-[60vh] w-[60vw] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.86 0.08 86 / 0.32), transparent 65%)",
          filter: "blur(20px)",
        }}
      />
      <Dust count={36} />

      <div className="relative z-10 mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold px-4 py-1.5 text-[11px] uppercase tracking-[0.32em] text-gold backdrop-blur-sm">
          <Sparkles aria-hidden className="h-3 w-3" />
          Enter Holy Ground
        </span>

        <h1 className="mt-8 font-serif text-5xl leading-[1.02] text-ivory sm:text-7xl md:text-[5.5rem]">
          Approach the
          <span className="block italic gold-text">Throne of Grace.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-base text-muted-foreground sm:text-lg">
          A confidential digital sanctuary for confession, prayer, pastoral
          counsel and quiet restoration. Come as you are — heard, held, and
          shepherded by ordained pastoral care.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/confess"
            className="candle-glow inline-flex items-center justify-center gap-2 rounded-md border border-gold bg-gradient-to-b from-gold/30 to-bronze/15 px-7 py-3 font-serif text-lg text-ivory transition-transform hover:scale-[1.02]"
          >
            <Flame aria-hidden className="h-5 w-5 text-gold candle-flicker" />
            Lay it down at the Altar
          </Link>
          <a
            href="#covenant"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
          >
            Read our Covenant of Confidence
          </a>
        </div>

        <div className="mt-16">
          <p className="mx-auto max-w-xl font-serif italic text-lg text-ivory/80">
            “Let us then approach the throne of grace with confidence…”
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-gold">
            Hebrews 4:16
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- CHAMBERS ---------- */
type Chamber = {
  icon: LucideIcon;
  title: string;
  verse: string;
  body: string;
  to: "/confess" | "/prayer" | "/counsel" | "/testimony" | "/restoration" | "/partners";
};

const CHAMBERS: Chamber[] = [
  {
    icon: ScrollText,
    title: "The Confession",
    verse: "1 John 1:9",
    body: "Lay it down in confidence. Submit anonymously and receive a sealed token to follow your pastoral response — no account required.",
    to: "/confess",
  },
  {
    icon: HandHeart,
    title: "The Prayer Altar",
    verse: "James 5:16",
    body: "Bring petitions for health, family, finances, or your walk. Each request is received by a prayer team and shepherded to resolution.",
    to: "/prayer",
  },
  {
    icon: MessagesSquare,
    title: "The Counsel",
    verse: "Proverbs 11:14",
    body: "Request marriage, family, grief, addiction or spiritual counseling. A pastor will be assigned and a meeting scheduled.",
    to: "/counsel",
  },
  {
    icon: BookOpenText,
    title: "The Testimony",
    verse: "Revelation 12:11",
    body: "Share the story of your restoration. Every testimony is reviewed by pastoral leadership before it is offered as a light to others.",
    to: "/testimony",
  },
  {
    icon: UsersRound,
    title: "Restoration Chambers",
    verse: "Galatians 6:1",
    body: "Pastor-led support communities for healing, recovery, marriage and faithfulness. Every chamber is shepherded — never unsupervised.",
    to: "/restoration",
  },
  {
    icon: Flame,
    title: "Prayer Partners",
    verse: "Matthew 18:20",
    body: "Anonymous one-to-one prayer matching. Pastor-supervised, confidential, and built on mutual covenant.",
    to: "/partners",
  },
];

function Chambers() {
  return (
    <section id="chambers" className="bg-altar relative py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
            The Sanctuary
          </p>
          <h2 className="mt-4 font-serif text-4xl text-ivory sm:text-5xl">
            Six chambers. One quiet sanctuary.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Each door opens onto a different kind of pastoral care. All are
            held in the same covenant of confidence.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-gold/20 bg-gold/10 sm:grid-cols-2 lg:grid-cols-3">
          {CHAMBERS.map((c) => (
            <ChamberCard key={c.title} chamber={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChamberCard({ chamber }: { chamber: Chamber }) {
  const Icon = chamber.icon;
  return (
    <Link
      to={chamber.to}
      className="group relative block bg-card/85 p-8 transition-colors hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="flex items-start justify-between">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gold bg-background/40 text-gold transition-transform group-hover:scale-105">
          <Icon aria-hidden className="h-5 w-5" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
          {chamber.verse}
        </span>
      </div>
      <h3 className="mt-6 font-serif text-2xl text-ivory">{chamber.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {chamber.body}
      </p>
      <p className="mt-5 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.28em] text-gold/80 transition-colors group-hover:text-gold">
        Enter the chamber →
      </p>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
    </Link>
  );
}


/* ---------- COVENANT ---------- */
type Promise = { icon: LucideIcon; title: string; body: string };
const PROMISES: Promise[] = [
  {
    icon: Lock,
    title: "Sealed in Confidence",
    body: "Submissions are encrypted at rest and never shared beyond ordained pastoral oversight. Confession content is never included in notifications or exports.",
  },
  {
    icon: KeyRound,
    title: "Anonymous by Design",
    body: "You may walk in without name or email. A secure tracking token — like THRONE-7A2K-L91D-Q5P8 — lets you follow your pastoral response in private.",
  },
  {
    icon: ShieldCheck,
    title: "Shepherded, Not Automated",
    body: "Every peer message and chamber is supervised by a pastor. There are no unmoderated rooms and no anonymous public forums.",
  },
];

function Covenant() {
  return (
    <section id="covenant" className="relative py-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, oklch(0.78 0.135 86 / 0.07), transparent 70%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl gap-14 px-4 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
            Our Covenant
          </p>
          <h2 className="mt-4 font-serif text-4xl text-ivory sm:text-5xl">
            Held in confidence. Shepherded in love.
          </h2>
          <p className="mt-5 text-muted-foreground">
            The Throne Room is not a forum. It is not a social network. It is
            not therapy. It is a ministry sanctuary built on three quiet
            promises.
          </p>
        </div>

        <div className="space-y-5">
          {PROMISES.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="flex gap-5 rounded-lg border border-gold/20 bg-card/70 p-6 shadow-engraved"
              >
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gold bg-background/40 text-gold">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-ivory">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- INVITATION ---------- */
function Invitation() {
  return (
    <section
      className="relative overflow-hidden py-28 text-center"
      style={{ backgroundColor: "oklch(0.09 0.008 260)" }}
    >
      <div
        aria-hidden
        className="heavenly-glow absolute -top-24 left-1/2 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.86 0.08 86 / 0.25), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div className="relative mx-auto max-w-2xl px-4">
        <h2 className="font-serif text-4xl text-ivory sm:text-5xl">
          You don't have to carry it
          <span className="block italic gold-text">another night.</span>
        </h2>
        <p className="mt-5 text-muted-foreground">
          A chair is already waiting at the altar. Come quietly, come as you
          are — a pastor will meet you here.
        </p>
        <Link
          to="/confess"
          className="candle-glow mt-10 inline-flex items-center justify-center gap-2 rounded-md border border-gold bg-gradient-to-b from-gold/30 to-bronze/15 px-8 py-3.5 font-serif text-lg text-ivory transition-transform hover:scale-[1.02]"
        >
          <Flame aria-hidden className="h-5 w-5 text-gold candle-flicker" />
          Enter the Sanctuary
        </Link>
      </div>
    </section>
  );
}
