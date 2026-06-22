import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ScrollText,
  HandHeart,
  MessagesSquare,
  BookOpenText,
  UsersRound,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/sanctuary/PageShell";
import bg from "@/assets/bg-sanctuary.jpg";
import bgConfess from "@/assets/bg-confess.jpg";
import bgPrayer from "@/assets/bg-prayer.jpg";
import bgCounsel from "@/assets/bg-counsel.jpg";
import bgTestimony from "@/assets/bg-testimony.jpg";
import bgRestoration from "@/assets/bg-restoration.jpg";
import bgPartners from "@/assets/bg-partners.jpg";

export const Route = createFileRoute("/sanctuary")({
  head: () => ({
    meta: [
      { title: "The Sanctuary — The Throne Room" },
      {
        name: "description",
        content:
          "Six chambers of pastoral care — confession, prayer, counsel, testimony, restoration and prayer partners. All held in covenant.",
      },
      { property: "og:title", content: "The Sanctuary — The Throne Room" },
      {
        property: "og:description",
        content: "Step into the sanctuary. Choose the chamber that meets you tonight.",
      },
    ],
  }),
  component: SanctuaryPage,
});

type Room = {
  to: "/confess" | "/prayer" | "/counsel" | "/testimony" | "/restoration" | "/partners";
  title: string;
  verse: string;
  icon: LucideIcon;
  bg: string;
  body: string;
};

const ROOMS: Room[] = [
  { to: "/confess", 
    title: "The Confession", 
    verse: "  ", 
    icon: ScrollText, 
    bg: bgConfess, 
    body: "Lay it down anonymously. Receive a sealed token for the pastoral response." 
  },
    
  { to: "/prayer", title: "The Wishing Well", verse: "  ", icon: HandHeart, bg: bgPrayer, body: "A pervert nun will carry your request before the throne." },
  { to: "/counsel", title: "The Counsel of Sinners", verse: "  ", icon: MessagesSquare, bg: bgCounsel, body: "Pastor-led conversations for marriage, grief, vocation and the long roads." },
  { to: "/testimony", title: "The Testimony", verse: "  ", icon: BookOpenText, bg: bgTestimony, body: "Tells of your lustful escapades ans how we helped. Reviewed by pastoral leadership before it speaks." },
  { to: "/restoration", title: "Restoration Chambers", verse: "  ", icon: UsersRound, bg: bgRestoration, body: "Small shepherded circles for healing, addiction encouragements and lewdness." },
  { to: "/partners", title: "Lusty Partners", verse: "  ", icon: Flame, bg: bgPartners, body: "Anonymous, covenantal, pastor-supervised one-to-one matching." },
];

function SanctuaryPage() {
  return (
    <PageShell
      background={bg}
      wide
      eyebrow="The Sanctuary"
      title={<>Six chambers. One altar.</>}
      subtitle="Each door opens onto a different kind of pastoral care. Step into the one that meets you tonight."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map((r) => (
          <RoomCard key={r.to} room={r} />
        ))}
      </div>
    </PageShell>
  );
}

function RoomCard({ room }: { room: Room }) {
  const Icon = room.icon;
  return (
    <Link
      to={room.to}
      className="group relative isolate block overflow-hidden rounded-xl border border-gold/25 transition-all hover:border-gold/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <img
        src={room.bg}
        alt=""
        aria-hidden
        loading="lazy"
        width={1536}
        height={896}
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50 transition-opacity group-hover:opacity-70"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.08 0.008 260 / 0.4) 0%, oklch(0.08 0.008 260 / 0.92) 100%)",
        }}
      />
      <div className="relative flex min-h-[18rem] flex-col justify-end p-6">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold bg-background/40 text-gold">
            <Icon aria-hidden className="h-4 w-4" />
          </span>
          <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
            {room.verse}
          </span>
        </div>
        <h2 className="mt-5 font-serif text-2xl text-ivory">{room.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ivory/75">{room.body}</p>
        <p className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.28em] text-gold/90 transition-colors group-hover:text-gold">
          Enter the chamber →
        </p>
      </div>
    </Link>
  );
}
