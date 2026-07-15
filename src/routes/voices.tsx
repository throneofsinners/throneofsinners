import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock, ScrollText, BookOpenText, Users, HandHeart, MapPin } from "lucide-react";
import { PageShell } from "@/components/sanctuary/PageShell";
import { listPublicVoices, type PublicVoice } from "@/lib/voices.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import bg from "@/assets/bg-voices.jpg";

export const Route = createFileRoute("/voices")({
  head: () => ({
    meta: [
      { title: "Voices of the Sanctuary — The Throne Room" },
      {
        name: "description",
        content:
          "Public confessions, testimonies and partner requests, lovingly excerpted and approved by pastoral leadership.",
      },
      { property: "og:title", content: "Voices of the Sanctuary" },
      {
        property: "og:description",
        content: "A window into the confessions and testimonies of the Throne Room.",
      },
    ],
  }),
  component: VoicesPage,
});

type TypeFilter = "all" | "confession" | "testimony" | "prayer" | "partner_request";

const TYPE_LABEL: Record<Exclude<TypeFilter, "all">, { label: string; Icon: typeof ScrollText }> = {
  confession: { label: "Confessions", Icon: ScrollText },
  testimony: { label: "Testimonies", Icon: BookOpenText },
  prayer: { label: "Prayer Requests", Icon: HandHeart },
  partner_request: { label: "Partner Requests", Icon: Users },
};

// Visibility limits by viewer tier.
const LIMITS: Record<"guest" | "free" | "regular" | "premium" | "staff", number> = {
  guest: 3,
  free: 10,
  regular: 30,
  premium: 200,
  staff: 200,
};

function VoicesPage() {
  const fn = useServerFn(listPublicVoices);
  const rolesFn = useServerFn(getMyRoles);
  const { data } = useQuery({
    queryKey: ["voices", "public"],
    queryFn: () => fn({ data: { limit: 200 } }),
  });

  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data: me } = useQuery({
    queryKey: ["me", "roles"],
    queryFn: () => rolesFn(),
    enabled: signedIn,
  });

  const viewerTier: keyof typeof LIMITS = useMemo(() => {
    if (!signedIn) return "guest";
    const roles = me?.roles ?? [];
    if (roles.includes("admin") || roles.includes("pastor")) return "staff";
    const tier = me?.profile?.membership_tier ?? "free";
    if (tier === "premium") return "premium";
    if (tier === "regular") return "regular";
    return "free";
  }, [signedIn, me]);

  const limit = LIMITS[viewerTier];
  const canSeeGated = viewerTier === "premium" || viewerTier === "staff";

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const allItems = data?.items ?? [];

  // Tier gating: guests and free-tier only see items admins flagged for free.
  const tierAllowed = canSeeGated
    ? allItems
    : allItems.filter((v) => v.free_visible !== false);

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = { all: tierAllowed.length };
    tierAllowed.forEach((v) => (c[v.type] = (c[v.type] ?? 0) + 1));
    return c;
  }, [tierAllowed]);

  const byType =
    typeFilter === "all" ? tierAllowed : tierAllowed.filter((v) => v.type === typeFilter);

  const categories = useMemo(() => {
    const set = new Set<string>();
    byType.forEach((v) => v.category && set.add(v.category));
    return Array.from(set).sort();
  }, [byType]);

  const filtered =
    categoryFilter === "all" ? byType : byType.filter((v) => v.category === categoryFilter);

  const visible = filtered.slice(0, limit);
  const hidden = Math.max(0, filtered.length - visible.length);
  const hiddenByTier = canSeeGated ? 0 : Math.max(0, allItems.length - tierAllowed.length);

  return (
    <PageShell
      background={bg}
      wide
      eyebrow="Voices of the Sanctuary"
      title={<>Grace, in their own words.</>}
      subtitle="Every voice below was reviewed by pastoral leadership. Names and full content are never shared."
    >
      {/* Type tabs */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <TabButton
          active={typeFilter === "all"}
          onClick={() => {
            setTypeFilter("all");
            setCategoryFilter("all");
          }}
        >
          All voices <span className="opacity-60">· {typeCounts.all ?? 0}</span>
        </TabButton>
        {(Object.keys(TYPE_LABEL) as Array<keyof typeof TYPE_LABEL>).map((t) => {
          const { label, Icon } = TYPE_LABEL[t];
          const count = typeCounts[t] ?? 0;
          if (count === 0) return null;
          return (
            <TabButton
              key={t}
              active={typeFilter === t}
              onClick={() => {
                setTypeFilter(t);
                setCategoryFilter("all");
              }}
            >
              <Icon className="h-3.5 w-3.5" /> {label}{" "}
              <span className="opacity-60">· {count}</span>
            </TabButton>
          );
        })}
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <ChipButton
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
          >
            all topics
          </ChipButton>
          {categories.map((c) => (
            <ChipButton
              key={c}
              active={categoryFilter === c}
              onClick={() => setCategoryFilter(c)}
            >
              {c.replace(/_/g, " ")}
            </ChipButton>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {allItems.length === 0
            ? "The first voices will appear here as pastors approve them."
            : "No voices match this filter yet."}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((v) => (
          <VoiceCard key={v.id} v={v} />
        ))}
      </div>

      {(hidden > 0 || hiddenByTier > 0) && (
        <div className="mt-10 rounded-xl border border-gold/30 bg-card/70 p-8 text-center shadow-engraved">
          <Lock className="mx-auto h-5 w-5 text-gold" aria-hidden />
          <h3 className="mt-3 font-serif text-2xl text-ivory">
            {signedIn && !canSeeGated
              ? `${hidden + hiddenByTier} more voices are reserved for premium members.`
              : !signedIn
                ? `${hidden + hiddenByTier} more voices await beyond the veil.`
                : `${hidden} more voices in this filter.`}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {!signedIn
              ? "Join the sanctuary — it is free and confidential — to read further."
              : !canSeeGated
                ? "Upgrade your membership to read every voice the pastors have made public."
                : "Loosen a filter above to see the rest."}
          </p>
          {!signedIn && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/auth"
                className="candle-glow inline-flex items-center justify-center rounded-md border border-gold bg-gradient-to-b from-gold/30 to-bronze/15 px-6 py-2.5 font-serif text-base text-ivory transition-transform hover:scale-[1.02]"
              >
                Enter the Sanctuary
              </Link>
              <Link
                to="/sanctuary"
                className="text-xs uppercase tracking-[0.22em] text-gold/80 hover:text-gold"
              >
                Explore the Chambers
              </Link>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.22em] transition-colors ${
        active
          ? "border-gold bg-gold/15 text-ivory"
          : "border-border bg-background/40 text-muted-foreground hover:border-gold/40 hover:text-ivory"
      }`}
    >
      {children}
    </button>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[11px] capitalize transition-colors ${
        active
          ? "border-gold/60 bg-gold/10 text-ivory"
          : "border-border/70 bg-background/30 text-muted-foreground hover:border-gold/40 hover:text-ivory"
      }`}
    >
      {children}
    </button>
  );
}

function VoiceCard({ v }: { v: PublicVoice }) {
  const key = (v.type as keyof typeof TYPE_LABEL) in TYPE_LABEL ? (v.type as keyof typeof TYPE_LABEL) : null;
  const Icon = key ? TYPE_LABEL[key].Icon : ScrollText;
  const typeLabel = key ? TYPE_LABEL[key].label.replace(/s$/, "") : v.type;
  return (
    <article className="altar-card flex flex-col gap-3 p-6">
      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold/90">
        <Icon className="h-3.5 w-3.5" />
        {typeLabel}
        {v.category && <span className="text-muted-foreground">· {v.category.replace(/_/g, " ")}</span>}
        {v.location && (
          <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground normal-case tracking-normal">
            <MapPin className="h-3 w-3" /> {v.location}
          </span>
        )}
      </div>
      <h2 className="font-serif text-xl text-ivory">{v.title}</h2>
      {v.image_urls.length > 0 && (
        <div className={`grid gap-2 ${v.image_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {v.image_urls.slice(0, 4).map((url, i) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-md border border-gold/20 bg-background"
            >
              <img
                src={url}
                alt={`${v.title} — attached image ${i + 1}`}
                loading="lazy"
                className="h-40 w-full object-cover transition-transform hover:scale-[1.02]"
              />
            </a>
          ))}
        </div>
      )}
      <p className="font-serif italic leading-relaxed text-ivory/85">"{v.excerpt}"</p>
      {v.pastoral_response && (
        <div className="mt-2 rounded-md border-l-2 border-gold/60 bg-background/30 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold/80">Pastoral response</p>
          <p className="mt-1 whitespace-pre-wrap font-serif text-sm leading-relaxed text-ivory/80">
            {v.pastoral_response}
          </p>
        </div>
      )}
    </article>
  );
}
