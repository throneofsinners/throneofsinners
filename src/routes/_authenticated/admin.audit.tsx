import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listAuditLog } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit log" }, { name: "robots", content: "noindex" }] }),
  component: Audit,
});

function Audit() {
  const fn = useServerFn(listAuditLog);
  const { data, isLoading, error } = useQuery({ queryKey: ["audit"], queryFn: () => fn() });

  if (error)
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 text-red-300">{(error as Error).message}</main>
    );

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/dashboard"
        className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-ivory"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Audit Log</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Immutable record of pastoral and admin actions. Last 200 events.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entity</th>
              <th className="px-3 py-2">Details</th>
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
            {data?.map((e) => (
              <tr key={e.id} className="border-t border-border/60 align-top">
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {new Date(e.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-ivory">{e.actor_email ?? "system"}</td>
                <td className="px-3 py-2 font-mono text-xs text-gold">{e.action}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {e.entity_type}
                  {e.entity_id ? `:${e.entity_id.slice(0, 8)}` : ""}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  <code>{JSON.stringify(e.metadata)}</code>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
