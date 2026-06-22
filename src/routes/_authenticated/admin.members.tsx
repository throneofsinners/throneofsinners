import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMembers, setMembershipTier } from "@/lib/members.functions";
import { PageShell } from "@/components/sanctuary/PageShell";

export const Route = createFileRoute("/_authenticated/admin/members")({
  head: () => ({
    meta: [{ title: "Members & Tiers" }, { name: "robots", content: "noindex" }],
  }),
  component: MembersPage,
});

const TIERS = ["free", "regular", "premium"] as const;

function MembersPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMembers);
  const setFn = useServerFn(setMembershipTier);

  const { data = [] } = useQuery({ queryKey: ["members"], queryFn: () => listFn() });
  const mutate = useMutation({
    mutationFn: (vars: { user_id: string; tier: "free" | "regular" | "premium" }) =>
      setFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });

  return (
    <PageShell
      wide
      eyebrow="Admin · Membership"
      title={<>Members & Tiers</>}
      subtitle="Promote members between Free, Regular and Premium. Premium unlocks direct pastor contact and the anonymous-confessions feed."
    >
      <div className="overflow-hidden rounded-lg border border-gold/20">
        <table className="w-full text-sm">
          <thead className="bg-card text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Set tier</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id} className="border-t border-border/60 bg-background/40">
                <td className="px-4 py-3 text-ivory">{m.display_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs uppercase tracking-[0.18em] text-gold">
                    {m.membership_tier}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {TIERS.map((t) => (
                      <button
                        key={t}
                        disabled={mutate.isPending || m.membership_tier === t}
                        onClick={() => mutate.mutate({ user_id: m.id, tier: t })}
                        className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-ivory hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
