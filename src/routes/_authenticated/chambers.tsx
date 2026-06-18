import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listChambers, createChamber, joinChamber, getMyRoles } from "@/lib/chambers.functions";
import { getMyRoles as getRoles } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/chambers")({
  head: () => ({ meta: [{ title: "Peer Chambers" }, { name: "robots", content: "noindex" }] }),
  component: Chambers,
});

// reference imported but use admin.getMyRoles to avoid duplicating
void getMyRoles;

function Chambers() {
  const qc = useQueryClient();
  const listFn = useServerFn(listChambers);
  const createFn = useServerFn(createChamber);
  const joinFn = useServerFn(joinChamber);
  const rolesFn = useServerFn(getRoles);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => rolesFn() });
  const { data: chambers, isLoading } = useQuery({ queryKey: ["chambers"], queryFn: () => listFn() });

  const isPastoral = me?.roles.some((r) => r === "pastor" || r === "admin");
  const [topic, setTopic] = useState("");
  const [desc, setDesc] = useState("");
  const [cap, setCap] = useState(6);
  const [joinFor, setJoinFor] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState("");

  const create = useMutation({
    mutationFn: () => createFn({ data: { topic, description: desc || null, capacity: cap } }),
    onSuccess: () => { setTopic(""); setDesc(""); qc.invalidateQueries({ queryKey: ["chambers"] }); },
  });
  const join = useMutation({
    mutationFn: (id: string) => joinFn({ data: { chamber_id: id, pseudonym: pseudo } }),
    onSuccess: () => { setJoinFor(null); setPseudo(""); qc.invalidateQueries({ queryKey: ["chambers"] }); },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/dashboard" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-ivory">← Dashboard</Link>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Peer Restoration Chambers</h1>
      <p className="mt-1 text-sm text-muted-foreground">Small circles where members walk together. Anonymous to one another, watched by stewards.</p>

      {isPastoral && (
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
          className="mt-6 grid gap-3 rounded-lg border border-gold/30 bg-secondary/40 p-4 sm:grid-cols-4">
          <input required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (e.g. Healing from addiction)"
            className="sm:col-span-2 rounded-md border border-border bg-background px-3 py-2 text-ivory" />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description"
            className="rounded-md border border-border bg-background px-3 py-2 text-ivory" />
          <input type="number" min={2} max={20} value={cap} onChange={(e) => setCap(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-3 py-2 text-ivory" />
          <button className="sm:col-span-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60" disabled={create.isPending}>
            {create.isPending ? "Opening…" : "Open chamber"}
          </button>
          {create.error && <p className="sm:col-span-4 text-sm text-red-400">{(create.error as Error).message}</p>}
        </form>
      )}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {isLoading && <li className="text-muted-foreground">Loading…</li>}
        {chambers?.map((c) => (
          <li key={c.id} className="rounded-lg border border-border bg-secondary/30 p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-xl text-ivory">{c.topic}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === "open" ? "bg-emerald-500/15 text-emerald-300" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
            </div>
            {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
            <p className="mt-3 text-xs text-muted-foreground">{c.member_count}/{c.capacity} present</p>
            <div className="mt-4 flex gap-2">
              {c.joined ? (
                <Link to="/chambers/$id" params={{ id: c.id }}
                  className="rounded-md border border-gold/40 bg-gold/10 px-3 py-1.5 text-sm text-ivory hover:bg-gold/15">
                  Enter chamber
                </Link>
              ) : joinFor === c.id ? (
                <div className="flex w-full gap-2">
                  <input autoFocus value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Choose a pseudonym"
                    className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-ivory" />
                  <button onClick={() => join.mutate(c.id)} disabled={pseudo.trim().length < 2 || join.isPending}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">
                    Join
                  </button>
                  <button onClick={() => setJoinFor(null)} className="rounded-md border border-border bg-secondary px-2 py-1.5 text-xs text-muted-foreground">Cancel</button>
                </div>
              ) : (
                <button onClick={() => { setJoinFor(c.id); setPseudo(""); }}
                  disabled={c.member_count >= c.capacity || c.status !== "open"}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">
                  {c.member_count >= c.capacity ? "Full" : "Join chamber"}
                </button>
              )}
              {isPastoral && !c.joined && (
                <Link to="/chambers/$id" params={{ id: c.id }} className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-muted-foreground hover:text-ivory">
                  Steward view
                </Link>
              )}
            </div>
            {join.error && joinFor === c.id && <p className="mt-2 text-sm text-red-400">{(join.error as Error).message}</p>}
          </li>
        ))}
        {chambers?.length === 0 && <li className="text-muted-foreground">No chambers yet.{isPastoral ? " Open the first one above." : ""}</li>}
      </ul>
    </main>
  );
}
