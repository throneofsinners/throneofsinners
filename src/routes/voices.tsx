import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock, ScrollText, BookOpenText } from "lucide-react";
import { PageShell } from "@/components/sanctuary/PageShell";
import { listPublicVoices } from "@/lib/voices.functions";
import { supabase } from "@/integrations/supabase/client";
import bg from "@/assets/bg-voices.jpg";

const GUEST_LIMIT = 3;

export const Route = createFileRoute("/voices")({
  head: () => ({
    meta: [
      { title: "Voices of the Sanctuary — The Throne Room" },
      {
        name: "description",
        content:
          "Public confessions and testimonies, lovingly excerpted and approved by pastoral leadership. A window into grace at work.",
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

function VoicesPage() {
  const fn = useServerFn(listPublicVoices);
  const { data } = useQuery({
    queryKey: ["voices", "public"],
    queryFn: () => fn({ data: { limit: 60 } }),
  });

  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const items = data?.items ?? [];
  const visible = signedIn ? items : items.slice(0, GUEST_LIMIT);
  const hidden = signedIn ? 0 : Math.max(0, items.length - GUEST_LIMIT);

  return (
    <PageShell
      background={bg}
      wide
      eyebrow="Voices of the Sanctuary"
      title={<>Grace, in their own words.</>}
      subtitle="Every voice below was opted in by its author and reviewed by pastoral leadership. Names, contact details and full content are never shared."
    >
      {items.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          The first voices will appear here as pastors approve them.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((v) => (
          <article key={v.id} className="altar-card flex flex-col gap-3 p-6">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold/90">
              {v.type === "confession" ? (
                <ScrollText className="h-3.5 w-3.5" />
              ) : (
                <BookOpenText className="h-3.5 w-3.5" />
              )}
              {v.type === "confession" ? "Confession" : "Testimony"}
              {v.category && <span className="text-muted-foreground">· {v.category}</span>}
            </div>
            <h2 className="font-serif text-xl text-ivory">{v.title}</h2>
            <p className="font-serif italic leading-relaxed text-ivory/85">
              "{v.excerpt}"
            </p>
          </article>
        ))}
      </div>

      {hidden > 0 && (
        <div className="mt-10 rounded-xl border border-gold/30 bg-card/70 p-8 text-center shadow-engraved">
          <Lock className="mx-auto h-5 w-5 text-gold" aria-hidden />
          <h3 className="mt-3 font-serif text-2xl text-ivory">
            {hidden} more voices await beyond the veil.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Join the sanctuary to read the rest. Membership is free and confidential —
            simply create an account.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="candle-glow inline-flex items-center justify-center rounded-md border border-gold bg-gradient-to-b from-gold/30 to-bronze/15 px-6 py-2.5 font-serif text-base text-ivory transition-transform hover:scale-[1.02]"
            >
              Enter the Sanctuary
            </Link>
            <Link to="/sanctuary" className="text-xs uppercase tracking-[0.22em] text-gold/80 hover:text-gold">
              Explore the Chambers
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
