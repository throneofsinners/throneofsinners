import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ScrollText, HandHeart } from "lucide-react";
import { PageShell } from "@/components/sanctuary/PageShell";
import { listAnonymousFeed } from "@/lib/pastor-messages.functions";
import { getMyRoles } from "@/lib/admin.functions";
import bg from "@/assets/bg-voices.jpg";

export const Route = createFileRoute("/_authenticated/anonymous-feed")({
  head: () => ({
    meta: [{ title: "Anonymous Feed — Premium" }, { name: "robots", content: "noindex" }],
  }),
  component: AnonymousFeedPage,
});

function AnonymousFeedPage() {
  const meFn = useServerFn(getMyRoles);
  const feedFn = useServerFn(listAnonymousFeed);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const tier = me?.profile?.membership_tier;
  const isPremium = tier === "premium";

  const { data: items = [], error } = useQuery({
    queryKey: ["anon-feed"],
    queryFn: () => feedFn(),
    enabled: isPremium,
  });

  if (!isPremium) {
    return (
      <PageShell
        background={bg}
        eyebrow="Premium · Anonymous Confessions"
        title={<>Reserved for premium members.</>}
        subtitle="Premium members may read anonymous confessions and the pastoral responses they received — read-only, never replied to."
      >
        <div className="altar-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Reach out to an admin to upgrade your membership.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-md border border-gold/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ivory hover:border-gold hover:text-gold"
          >
            Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      background={bg}
      wide
      eyebrow="Premium · Anonymous Confessions"
      title={<>Hear the sanctuary, in confidence.</>}
      subtitle="Anonymous confessions and the pastoral responses they received. Read-only — premium members may not reply."
    >
      {error && (
        <p className="text-center text-sm text-destructive-foreground">
          {(error as Error).message}
        </p>
      )}
      <div className="space-y-5">
        {items.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No responded confessions yet.
          </p>
        )}
        {items.map((s) => (
          <article key={s.id} className="altar-card p-6">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold/90">
              {s.type === "confession" ? (
                <ScrollText className="h-3.5 w-3.5" />
              ) : (
                <HandHeart className="h-3.5 w-3.5" />
              )}
              {s.type}
              {s.category && <span className="text-muted-foreground">· {s.category}</span>}
            </div>
            <p className="mt-4 whitespace-pre-wrap font-serif text-lg leading-relaxed text-ivory/90">
              {s.content}
            </p>
            {s.pastoral_response && (
              <div className="mt-5 rounded-md border-l-2 border-gold/60 bg-background/30 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-gold/90">
                  Pastoral response
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ivory/85">
                  {s.pastoral_response}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
