import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyRoles, listSubmissions } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Sanctuary Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const rolesFn = useServerFn(getMyRoles);
  const listFn = useServerFn(listSubmissions);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => rolesFn() });
  const { data: subs } = useQuery({
    queryKey: ["inbox", "summary"],
    queryFn: () => listFn({ data: { status: "all", type: "all", risk_only: false, q: "" } }),
  });

  const total = subs?.length ?? 0;
  const flagged = subs?.filter((s) => s.risk_flagged).length ?? 0;
  const unresponded = subs?.filter((s) => s.status === "received" || s.status === "in_review").length ?? 0;
  const isAdmin = me?.roles.includes("admin");

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Inner court</p>
          <h1 className="mt-2 font-serif text-3xl text-ivory">
            Peace be with you{me?.profile?.display_name ? `, ${me.profile.display_name}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Roles: {(me?.roles ?? []).join(", ") || "member"}
          </p>
        </div>
        <button onClick={signOut} className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-ivory hover:bg-gold/10">
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Awaiting prayer" value={unresponded} />
        <Stat label="Crisis flagged" value={flagged} accent={flagged > 0} />
        <Stat label="Total in sanctuary" value={total} />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile to="/inbox" title="Moderation Inbox" body="Review confessions and prayer requests. Triage by status and risk." />
        <Tile to="/chambers" title="Peer Chambers" body="Restoration circles where members walk together under a steward." />
        {isAdmin && <Tile to="/admin/invites" title="Invite Pastors" body="Send invitations. Grant roles. Manage shepherds." />}
        {isAdmin && <Tile to="/admin/audit" title="Audit Log" body="Every pastoral action, immutable and timestamped." />}
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-lg border ${accent ? "border-red-500/40 bg-red-950/30" : "border-border bg-secondary/40"} p-5`}>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-serif text-4xl ${accent ? "text-red-300" : "text-ivory"}`}>{value}</p>
    </div>
  );
}

function Tile({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link to={to} className="block rounded-lg border border-border bg-secondary/30 p-5 transition-colors hover:border-gold/40 hover:bg-gold/5">
      <h2 className="font-serif text-xl text-ivory">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
