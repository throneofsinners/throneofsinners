import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { getChamber, postChamberMessage, leaveChamber } from "@/lib/chambers.functions";

export const Route = createFileRoute("/_authenticated/chambers/$id")({
  head: () => ({ meta: [{ title: "Chamber" }, { name: "robots", content: "noindex" }] }),
  component: Chamber,
});

function Chamber() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const getFn = useServerFn(getChamber);
  const postFn = useServerFn(postChamberMessage);
  const leaveFn = useServerFn(leaveChamber);

  const { data, isLoading } = useQuery({
    queryKey: ["chamber", id],
    queryFn: () => getFn({ data: { id } }),
    refetchInterval: 5000,
  });

  const [body, setBody] = useState("");
  const post = useMutation({
    mutationFn: () => postFn({ data: { chamber_id: id, body } }),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["chamber", id] });
    },
  });
  const leave = useMutation({
    mutationFn: () => leaveFn({ data: { chamber_id: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chambers"] }),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [data?.messages.length]);

  if (isLoading)
    return <main className="mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Loading…</main>;
  if (!data) return null;
  const { chamber, members, messages, isMember, isPastoral, me } = data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/chambers"
        className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-ivory"
      >
        ← Chambers
      </Link>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ivory">{chamber.topic}</h1>
          {chamber.description && (
            <p className="mt-1 text-sm text-muted-foreground">{chamber.description}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {members.length}/{chamber.capacity} present {isPastoral && "· steward view"}
          </p>
        </div>
        {isMember && (
          <button
            onClick={() => leave.mutate()}
            className="text-xs text-muted-foreground hover:text-red-300 hover:underline"
          >
            Leave chamber
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto rounded-md border border-border bg-secondary/30 px-3 py-2 text-xs">
        {members.map((m) => (
          <span
            key={m.id}
            className={`rounded-full px-2 py-0.5 ${m.is_me ? "bg-gold/20 text-ivory" : "bg-background text-muted-foreground"}`}
          >
            {m.pseudonym}
            {m.is_me && " (you)"}
          </span>
        ))}
        {members.length === 0 && <span className="text-muted-foreground">No members yet.</span>}
      </div>

      <div
        ref={scrollRef}
        className="mt-4 h-[480px] overflow-y-auto rounded-lg border border-border bg-background/40 p-4"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Silence. Be the first to speak in love.</p>
        )}
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-lg border p-3 ${m.is_mine ? "border-gold/40 bg-gold/5" : m.risk_flagged ? "border-red-500/40 bg-red-950/20" : "border-border bg-secondary/30"}`}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {m.pseudonym} · {new Date(m.created_at).toLocaleTimeString()}
                {m.risk_flagged && isPastoral && (
                  <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-200">
                    flagged
                  </span>
                )}
              </p>
              <p className="mt-1 whitespace-pre-wrap font-serif text-ivory">{m.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {isMember ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (body.trim()) post.mutate();
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={4000}
            placeholder={`Speak as ${me?.pseudonym ?? "yourself"}…`}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-ivory"
          />
          <button
            disabled={post.isPending || !body.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            Send
          </button>
        </form>
      ) : isPastoral ? (
        <p className="mt-4 rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          Steward view: read-only.
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Join this chamber from the chambers list to participate.
        </p>
      )}
    </main>
  );
}
