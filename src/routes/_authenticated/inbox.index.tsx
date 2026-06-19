import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listSubmissions, listCategories } from "@/lib/admin.functions";

const STATUSES = ["all","received","in_review","being_prayed_for","pastor_assigned","responded","resolved"] as const;
const TYPES = ["all","confession","prayer"] as const;

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({ meta: [{ title: "Moderation Inbox" }, { name: "robots", content: "noindex" }] }),
  component: Inbox,
});

function Inbox() {
  const navigate = useNavigate();
  const listFn = useServerFn(listSubmissions);
  const catsFn = useServerFn(listCategories);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [type, setType] = useState<(typeof TYPES)[number]>("all");
  const [category, setCategory] = useState<string>("all");
  const [riskOnly, setRiskOnly] = useState(false);
  const [q, setQ] = useState("");

  const { data: cats } = useQuery({
    queryKey: ["inbox-cats"],
    queryFn: () => catsFn(),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["inbox", status, type, category, riskOnly, q],
    queryFn: () => listFn({ data: { status, type, category, risk_only: riskOnly, q } }),
  });

  const visibleCats = (cats ?? []).filter((c) => type === "all" || c.type === type);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/dashboard" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-ivory">← Dashboard</Link>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Moderation Inbox</h1>
      <p className="mt-1 text-sm text-muted-foreground">Handle each submission with reverence. Crisis-flagged entries surface first.</p>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-secondary/30 p-4">
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as never)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-ivory">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
          </select>
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => { setType(e.target.value as never); setCategory("all"); }} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-ivory">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Topic">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-ivory capitalize">
            <option value="all">all topics</option>
            {visibleCats.map((c) => (
              <option key={`${c.type}:${c.value}`} value={c.value}>
                {c.value.replace(/_/g," ")} ({c.count})
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-ivory">
          <input type="checkbox" checked={riskOnly} onChange={(e) => setRiskOnly(e.target.checked)} />
          Crisis-flagged only
        </label>
        <Field label="Search content">
          <input value={q} onChange={(e) => setQ(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-ivory" placeholder="keyword…" />
        </Field>
        <button onClick={() => refetch()} className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-ivory hover:bg-gold/10">Refresh</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Token</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Topic</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Risk</th>
              <th className="px-3 py-2">Received</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-3 py-6 text-muted-foreground">Loading…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-muted-foreground">No submissions match.</td></tr>
            )}
            {data?.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate({ to: "/inbox/$id", params: { id: s.id } })}
                className={`cursor-pointer border-t border-border/60 transition-colors hover:bg-secondary/40 ${s.risk_flagged ? "bg-red-950/20" : ""}`}
              >
                <td className="px-3 py-2 font-mono text-xs text-gold">{s.tracking_token}</td>
                <td className="px-3 py-2 capitalize">{s.type}</td>
                <td className="px-3 py-2 capitalize text-ivory/90">{s.category ? s.category.replace(/_/g," ") : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-3 py-2 text-ivory">{s.status.replace(/_/g," ")}</td>
                <td className="px-3 py-2">{s.risk_flagged ? <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">FLAGGED</span> : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-3 py-2 text-muted-foreground">{new Date(s.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
