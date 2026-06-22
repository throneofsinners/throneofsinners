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
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => rolesFn() });

  const roles = me?.roles ?? [];
  const isPastor = roles.includes("pastor") || roles.includes("admin");
  const isAdmin = roles.includes("admin");
  const tier = me?.profile?.membership_tier ?? "free";

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Inner court</p>
          <h1 className="mt-2 font-serif text-3xl text-ivory">
            Peace be with you{me?.profile?.display_name ? `, ${me.profile.display_name}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPastor ? `Roles: ${roles.join(", ")}` : `Membership: ${tier}`}
          </p>
        </div>
        <button onClick={signOut} className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-ivory hover:bg-gold/10">
          Sign out
        </button>
      </div>

      {isPastor ? <PastorView /> : <MemberView tier={tier} />}

      {isAdmin && (
        <div className="mt-12">
          <h2 className="font-serif text-xl text-ivory">Administration</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Tile to="/admin/invites" title="Invite Pastors" body="Send invitations. Grant roles. Manage shepherds." />
            <Tile to="/admin/members" title="Members & Tiers" body="Promote members between Free, Regular, and Premium." />
            <Tile to="/admin/voices-queue" title="Voices Queue" body="Approve confessions & testimonies for public display." />
            <Tile to="/admin/audit" title="Audit Log" body="Every pastoral action, immutable and timestamped." />
          </div>
        </div>
      )}
    </main>
  );
}

function PastorView() {
  const listFn = useServerFn(listSubmissions);
  const { data: subs } = useQuery({
    queryKey: ["inbox", "summary"],
    queryFn: () =>
      listFn({ data: { status: "all", type: "all", risk_only: false, q: "" } }),
  });
  const total = subs?.length ?? 0;
  const flagged = subs?.filter((s) => s.risk_flagged).length ?? 0;
  const unresponded =
    subs?.filter((s) => s.status === "received" || s.status === "in_review").length ?? 0;

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Awaiting prayer" value={unresponded} />
        <Stat label="Crisis flagged" value={flagged} accent={flagged > 0} />
        <Stat label="Total in sanctuary" value={total} />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile to="/inbox" title="Moderation Inbox" body="Review confessions and prayer requests. Triage by status and risk." />
        <Tile to="/chambers" title="Peer Chambers" body="Restoration circles where members walk together under a steward." />
      </div>
    </>
  );
}

function MemberView({ tier }: { tier: "free" | "regular" | "premium" | string }) {
  const isPremium = tier === "premium";
  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <TierBadge tier={tier} />
        <CountTile label="Public voices" body="Unlimited reading" to="/voices" />
        <CountTile
          label="Direct pastor contact"
          body={isPremium ? "Available" : "Premium only"}
          to="/contact-pastors"
        />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile to="/voices" title="Voices of the Sanctuary" body="Read every public confession and testimony, unlimited." />
        <Tile to="/sanctuary" title="Enter a Chamber" body="Confess, request prayer, ask for counsel — six rooms await." />
        <Tile to="/lookup" title="My Scrolls" body="Look up your own submissions with your tracking token." />
        <Tile to="/pastors" title="Meet the Pastors" body="See pastoral profiles, bios and contact info." />
        {isPremium ? (
          <>
            <Tile
              to="/contact-pastors"
              title="Contact a Pastor"
              body="Write directly to a pastor — premium privilege."
              accent
            />
            <Tile
              to="/anonymous-feed"
              title="Anonymous Confessions Feed"
              body="Read anonymous confessions with pastoral responses. Read-only."
              accent
            />
          </>
        ) : (
          <UpgradeTile />
        )}
      </div>

      <p className="mt-8 rounded-md border border-gold/15 bg-card/50 p-4 text-xs text-muted-foreground">
        Anonymous confessions submitted to the sanctuary are visible only to
        ordained pastoral staff. Members never see or read anonymous content
        unless they are premium members reviewing the responded archive.
      </p>
    </>
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

function CountTile({ label, body, to }: { label: string; body: string; to: string }) {
  return (
    <Link to={to} className="block rounded-lg border border-border bg-secondary/40 p-5 hover:border-gold/40 hover:bg-gold/5">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-xl text-ivory">{body}</p>
    </Link>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const labels: Record<string, string> = {
    free: "Free member",
    regular: "Regular member",
    premium: "Premium member",
  };
  return (
    <div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Membership</p>
      <p className="mt-2 font-serif text-2xl gold-text">{labels[tier] ?? tier}</p>
    </div>
  );
}

function UpgradeTile() {
  return (
    <div className="rounded-lg border border-gold/40 bg-gradient-to-b from-gold/10 to-transparent p-5">
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Upgrade</p>
      <h3 className="mt-2 font-serif text-xl text-ivory">Become a Premium member</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Premium unlocks direct messaging with pastors and a read-only window into
        anonymous confessions with their pastoral responses.
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        Contact an admin to be promoted.
      </p>
    </div>
  );
}

function Tile({
  to,
  title,
  body,
  accent,
}: {
  to: string;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`block rounded-lg border p-5 transition-colors ${
        accent
          ? "border-gold/50 bg-gold/5 hover:bg-gold/10"
          : "border-border bg-secondary/30 hover:border-gold/40 hover:bg-gold/5"
      }`}
    >
      <h2 className="font-serif text-xl text-ivory">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
