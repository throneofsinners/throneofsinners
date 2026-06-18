import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/sanctuary/PageShell";
import { getSubmissionByToken } from "@/lib/submissions.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/lookup/$token")({
  head: () => ({
    meta: [
      { title: "Your submission — The Throne Room" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LookupTokenPage,
});

const STATUS_LABEL: Record<string, string> = {
  received: "Received",
  in_review: "Under pastoral review",
  being_prayed_for: "Being prayed for",
  pastor_assigned: "Pastor assigned",
  responded: "Pastoral response ready",
  resolved: "Resolved",
};

function LookupTokenPage() {
  const { token } = Route.useParams();
  const router = useRouter();
  const lookup = useServerFn(getSubmissionByToken);
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "missing" }
    | { kind: "error"; message: string }
    | {
        kind: "ok";
        row: NonNullable<Awaited<ReturnType<typeof getSubmissionByToken>>>;
      }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    lookup({ data: { token } })
      .then((row) => {
        if (cancelled) return;
        if (!row) setState({ kind: "missing" });
        else setState({ kind: "ok", row });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Lookup failed",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [token, lookup]);

  return (
    <PageShell
      eyebrow="Your sacred record"
      title={<>The scroll.</>}
      subtitle={
        <span className="font-mono text-sm tracking-wider text-gold/80">
          {token}
        </span>
      }
    >
      {state.kind === "loading" && (
        <div className="altar-card flex items-center justify-center gap-3 p-10 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Opening the scroll…
        </div>
      )}

      {state.kind === "missing" && (
        <div className="altar-card p-8 text-center">
          <p className="font-serif text-2xl text-ivory">No record found.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We could not find a submission with that tracking code. Double-check
            the letters and numbers — it's case-insensitive.
          </p>
          <Link
            to="/lookup"
            className="mt-6 inline-flex rounded-md border border-gold/40 px-4 py-2 text-sm text-ivory hover:bg-gold/10"
          >
            Try a different code
          </Link>
        </div>
      )}

      {state.kind === "error" && (
        <div className="altar-card p-8 text-center">
          <p className="font-serif text-2xl text-ivory">Something interrupted.</p>
          <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
          <button
            onClick={() => router.invalidate()}
            className="mt-6 inline-flex rounded-md border border-gold/40 px-4 py-2 text-sm text-ivory hover:bg-gold/10"
          >
            Try again
          </button>
        </div>
      )}

      {state.kind === "ok" && (
        <div className="space-y-6">
          <div className="altar-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {state.row.type === "confession" ? "Confession" : "Prayer request"}
                {state.row.category ? ` · ${state.row.category}` : ""}
              </p>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold">
                {STATUS_LABEL[state.row.status] ?? state.row.status}
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Submitted {new Date(state.row.created_at).toLocaleString()}
            </p>
          </div>

          <div className="altar-card p-6">
            <h2 className="font-serif text-xl text-ivory">Pastoral responses</h2>
            <div className="gold-rule my-3" />
            {state.row.responses && state.row.responses.length > 0 ? (
              <ul className="space-y-5">
                {state.row.responses.map((r) => (
                  <li key={r.id}>
                    <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-ivory">{r.body}</p>
                    {r.scripture_reference && (
                      <p className="mt-2 font-serif italic text-gold">— {r.scripture_reference}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {r.author_display_name ?? "A pastor"} · {new Date(r.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                A pastor has not yet responded. You will see their reply here as
                soon as it is ready. Thank you for your patience — every message
                is read with care.
              </p>
            )}
          </div>

        </div>
      )}
    </PageShell>
  );
}
