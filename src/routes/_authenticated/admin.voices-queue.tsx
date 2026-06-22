import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listPendingPublic,
  approvePublicSubmission,
  rejectPublicSubmission,
} from "@/lib/members.functions";
import { PageShell } from "@/components/sanctuary/PageShell";

export const Route = createFileRoute("/_authenticated/admin/voices-queue")({
  head: () => ({
    meta: [{ title: "Voices Queue" }, { name: "robots", content: "noindex" }],
  }),
  component: QueuePage,
});

function QueuePage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listPendingPublic);
  const approveFn = useServerFn(approvePublicSubmission);
  const rejectFn = useServerFn(rejectPublicSubmission);

  const { data = [] } = useQuery({
    queryKey: ["voices", "pending"],
    queryFn: () => listFn(),
  });
  const approve = useMutation({
    mutationFn: (v: { id: string; public_title: string; public_excerpt: string }) =>
      approveFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voices"] }),
  });
  const reject = useMutation({
    mutationFn: (id: string) => rejectFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voices"] }),
  });

  return (
    <PageShell
      wide
      eyebrow="Admin · Voices Queue"
      title={<>Approve public voices.</>}
      subtitle="Members who opted in to public display. Edit the excerpt, then approve — only the excerpt appears on /voices."
    >
      {data.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nothing to review.
        </p>
      )}
      <div className="space-y-5">
        {data.map((s) => (
          <QueueCard
            key={s.id}
            item={s}
            onApprove={(title, excerpt) =>
              approve.mutate({ id: s.id, public_title: title, public_excerpt: excerpt })
            }
            onReject={() => reject.mutate(s.id)}
          />
        ))}
      </div>
    </PageShell>
  );
}

type Item = {
  id: string;
  type: string;
  category: string | null;
  content: string;
  public_title: string | null;
  public_excerpt: string | null;
  tracking_token: string;
};

function QueueCard({
  item,
  onApprove,
  onReject,
}: {
  item: Item;
  onApprove: (title: string, excerpt: string) => void;
  onReject: () => void;
}) {
  const [title, setTitle] = useState(item.public_title ?? "");
  const [excerpt, setExcerpt] = useState(
    item.public_excerpt ?? item.content.slice(0, 280),
  );

  function submit(e: FormEvent) {
    e.preventDefault();
    onApprove(title.trim(), excerpt.trim());
  }

  return (
    <form onSubmit={submit} className="altar-card grid gap-4 p-6 lg:grid-cols-2">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-gold/90">
          {item.type} · {item.category ?? "general"}
        </p>
        <p className="mt-2 whitespace-pre-wrap font-serif text-base leading-relaxed text-ivory/85">
          {item.content}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Token: {item.tracking_token}
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs uppercase tracking-wide text-muted-foreground">
            Public title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-muted-foreground">
            Public excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={600}
            rows={5}
            required
            className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="candle-glow inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Approve & publish
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-md border border-border bg-secondary px-4 py-2 text-sm text-ivory hover:bg-destructive/20"
          >
            Reject
          </button>
        </div>
      </div>
    </form>
  );
}
