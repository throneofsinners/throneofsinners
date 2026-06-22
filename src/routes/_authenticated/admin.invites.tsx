import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listInvitations, createInvitation, revokeInvitation } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/invites")({
  head: () => ({ meta: [{ title: "Invite pastors" }, { name: "robots", content: "noindex" }] }),
  component: Invites,
});

function Invites() {
  const qc = useQueryClient();
  const listFn = useServerFn(listInvitations);
  const createFn = useServerFn(createInvitation);
  const revokeFn = useServerFn(revokeInvitation);
  const { data, isLoading, error } = useQuery({ queryKey: ["invites"], queryFn: () => listFn() });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"pastor" | "peer_mentor" | "admin">("pastor");
  const create = useMutation({
    mutationFn: () => createFn({ data: { email, role } }),
    onSuccess: () => {
      setEmail("");
      qc.invalidateQueries({ queryKey: ["invites"] });
    },
  });
  const revoke = useMutation({
    mutationFn: (id: string) => revokeFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invites"] }),
  });

  if (error)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-red-300">{(error as Error).message}</main>
    );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/dashboard"
        className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-ivory"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Invite Pastors & Mentors</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add an email and role. When that person signs up at <code>/auth</code> with the invited
        email, the role is granted automatically.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-secondary/40 p-4"
      >
        <label className="flex-1">
          <span className="block text-xs uppercase tracking-wider text-muted-foreground">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-ivory"
          />
        </label>
        <label>
          <span className="block text-xs uppercase tracking-wider text-muted-foreground">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as never)}
            className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-ivory"
          >
            <option value="pastor">Pastor</option>
            <option value="peer_mentor">Peer Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button
          disabled={create.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {create.isPending ? "Inviting…" : "Send invite"}
        </button>
        {create.error && (
          <p className="w-full text-sm text-red-400">{(create.error as Error).message}</p>
        )}
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {data?.map((i) => (
              <tr key={i.id} className="border-t border-border/60">
                <td className="px-3 py-2 text-ivory">{i.email}</td>
                <td className="px-3 py-2 capitalize">{i.role}</td>
                <td className="px-3 py-2">
                  {i.accepted_at ? (
                    <span className="text-emerald-300">Accepted</span>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {new Date(i.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 text-right">
                  {!i.accepted_at && (
                    <button
                      onClick={() => revoke.mutate(i.id)}
                      className="text-xs text-red-300 hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                  No invitations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
