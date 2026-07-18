import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getSubmissionDetail,
  updateSubmissionStatus,
  createPastoralResponse,
  acknowledgeCrisisAlert,
  getSubmissionPhotoUrls,
} from "@/lib/admin.functions";
import {
  publishSubmissionPublic,
  unpublishSubmissionPublic,
} from "@/lib/members.functions";
import { recommendPartnerMatches } from "@/lib/pastors.functions";

const STATUSES = [
  "received",
  "in_review",
  "being_prayed_for",
  "pastor_assigned",
  "responded",
  "resolved",
] as const;

export const Route = createFileRoute("/_authenticated/inbox/$id")({
  head: () => ({ meta: [{ title: "Submission" }, { name: "robots", content: "noindex" }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const detailFn = useServerFn(getSubmissionDetail);
  const statusFn = useServerFn(updateSubmissionStatus);
  const respondFn = useServerFn(createPastoralResponse);
  const ackFn = useServerFn(acknowledgeCrisisAlert);
  const photoUrlsFn = useServerFn(getSubmissionPhotoUrls);

  const { data, isLoading } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => detailFn({ data: { id } }),
  });

  const imagePaths = (data?.submission as { image_paths?: string[] } | undefined)?.image_paths ?? [];
  const { data: photoUrls } = useQuery({
    queryKey: ["submission-photos", id, imagePaths],
    enabled: imagePaths.length > 0,
    queryFn: () => photoUrlsFn({ data: { paths: imagePaths } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["submission", id] });
    qc.invalidateQueries({ queryKey: ["inbox"] });
  };

  const setStatus = useMutation({
    mutationFn: (s: (typeof STATUSES)[number]) => statusFn({ data: { id, status: s } }),
    onSuccess: invalidate,
  });
  const ack = useMutation({
    mutationFn: (alertId: string) => ackFn({ data: { id: alertId } }),
    onSuccess: invalidate,
  });

  const [body, setBody] = useState("");
  const [scripture, setScripture] = useState("");
  const [isNote, setIsNote] = useState(false);
  const respond = useMutation({
    mutationFn: () =>
      respondFn({
        data: {
          submission_id: id,
          body,
          scripture_reference: scripture || null,
          is_internal_note: isNote,
        },
      }),
    onSuccess: () => {
      setBody("");
      setScripture("");
      setIsNote(false);
      invalidate();
    },
  });

  const publishFn = useServerFn(publishSubmissionPublic);
  const unpublishFn = useServerFn(unpublishSubmissionPublic);
  const publish = useMutation({
    mutationFn: (v: {
      public_title: string;
      public_excerpt: string;
      include_pastoral_response: boolean;
      free_visible: boolean;
    }) => publishFn({ data: { id, ...v } }),
    onSuccess: invalidate,
  });
  const unpublish = useMutation({
    mutationFn: () => unpublishFn({ data: { id } }),
    onSuccess: invalidate,
  });

  if (isLoading)
    return <main className="mx-auto max-w-4xl px-4 py-10 text-muted-foreground">Loading…</main>;
  if (!data)
    return <main className="mx-auto max-w-4xl px-4 py-10 text-muted-foreground">Not found.</main>;
  const { submission, responses, alerts } = data;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/inbox"
        className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-ivory"
      >
        ← Inbox
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ivory capitalize">{submission.type}</h1>
        <span className="font-mono text-xs text-gold">{submission.tracking_token}</span>
      </div>

      {submission.risk_flagged && (
        <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4">
          <p className="text-sm font-medium text-red-200">⚠ Crisis-flagged content</p>
          <p className="mt-1 text-xs text-red-200/80">
            Matched: {(submission.risk_keywords ?? []).join(", ") || "—"}
          </p>
          {alerts
            .filter((a) => !a.acknowledged_at)
            .map((a) => (
              <button
                key={a.id}
                onClick={() => ack.mutate(a.id)}
                disabled={ack.isPending}
                className="mt-3 rounded-md border border-red-400/60 bg-red-900/40 px-3 py-1.5 text-xs text-red-100 hover:bg-red-900/60"
              >
                Acknowledge alert
              </button>
            ))}
        </div>
      )}

      <section className="mt-6 rounded-lg border border-border bg-secondary/40 p-5">
        <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-ivory">
          {submission.content}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Received {new Date(submission.created_at).toLocaleString()}
          {submission.category && ` · ${submission.category}`}
          {submission.contact_name && ` · From ${submission.contact_name}`}
          {submission.contact_email && ` · ${submission.contact_email}`}
        </p>
      </section>

      {imagePaths.length > 0 && (
        <section className="mt-4 rounded-lg border border-border bg-secondary/30 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Attached photos ({imagePaths.length})
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {(photoUrls ?? []).map((p) => (
              <a
                key={p.path}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-md border border-border bg-background"
              >
                <img
                  src={p.url}
                  alt="Submission attachment"
                  className="h-40 w-full object-cover transition-transform group-hover:scale-[1.02]"
                />
              </a>
            ))}
            {imagePaths.length > 0 && !photoUrls && (
              <p className="col-span-full text-xs text-muted-foreground">Loading photos…</p>
            )}
          </div>
        </section>
      )}


      <section className="mt-6 rounded-lg border border-border bg-secondary/30 p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus.mutate(s)}
              disabled={setStatus.isPending}
              className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                submission.status === s
                  ? "border-gold/60 bg-gold/15 text-ivory"
                  : "border-border bg-background text-muted-foreground hover:border-gold/40 hover:text-ivory"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </section>

      <PublishPanel
        submission={submission}
        onPublish={(title, excerpt, includeResponse, freeVisible) =>
          publish.mutate({
            public_title: title,
            public_excerpt: excerpt,
            include_pastoral_response: includeResponse,
            free_visible: freeVisible,
          })
        }
        onUnpublish={() => unpublish.mutate()}
        publishing={publish.isPending || unpublish.isPending}
        error={(publish.error as Error | null)?.message ?? null}
      />



      <section className="mt-6 space-y-3">
        <h2 className="font-serif text-xl text-ivory">Response thread</h2>
        {responses.length === 0 && (
          <p className="text-sm text-muted-foreground">No responses yet.</p>
        )}
        {responses.map((r) => (
          <article
            key={r.id}
            className={`rounded-lg border p-4 ${r.is_internal_note ? "border-amber-700/40 bg-amber-950/20" : "border-border bg-secondary/30"}`}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {r.is_internal_note ? "Internal note" : "Pastoral reply"} ·{" "}
              {r.author_display_name ?? "Pastor"} · {new Date(r.created_at).toLocaleString()}
            </p>
            <p className="mt-2 whitespace-pre-wrap font-serif text-ivory">{r.body}</p>
            {r.scripture_reference && (
              <p className="mt-2 text-sm text-gold">— {r.scripture_reference}</p>
            )}
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-gold/30 bg-secondary/40 p-5">
        <h2 className="font-serif text-xl text-ivory">Compose reply</h2>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          maxLength={8000}
          placeholder="Write with mercy and truth…"
          className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 font-serif text-ivory"
        />
        <input
          value={scripture}
          onChange={(e) => setScripture(e.target.value)}
          maxLength={120}
          placeholder="Scripture reference (optional, e.g. Psalm 51:10)"
          className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ivory"
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-ivory">
          <input type="checkbox" checked={isNote} onChange={(e) => setIsNote(e.target.checked)} />
          Save as internal note only (not visible to submitter)
        </label>
        {respond.error && (
          <p className="mt-2 text-sm text-red-400">{(respond.error as Error).message}</p>
        )}
        <button
          onClick={() => respond.mutate()}
          disabled={respond.isPending || body.trim().length < 2}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {respond.isPending ? "Sending…" : isNote ? "Save internal note" : "Send pastoral reply"}
        </button>
      </section>
    </main>
  );
}

type PublishSubmission = {
  content: string;
  display_publicly: boolean | null;
  public_title: string | null;
  public_excerpt: string | null;
  public_approved_at: string | null;
  include_pastoral_response?: boolean | null;
  pastoral_response?: string | null;
  free_visible?: boolean | null;
};

function PublishPanel({
  submission,
  onPublish,
  onUnpublish,
  publishing,
  error,
}: {
  submission: PublishSubmission;
  onPublish: (
    title: string,
    excerpt: string,
    includeResponse: boolean,
    freeVisible: boolean,
  ) => void;
  onUnpublish: () => void;
  publishing: boolean;
  error: string | null;
}) {
  const isPublished = !!submission.public_approved_at && !!submission.display_publicly;
  const [title, setTitle] = useState(submission.public_title ?? "");
  const [excerpt, setExcerpt] = useState(
    submission.public_excerpt ?? submission.content.slice(0, 280),
  );
  const [includeResponse, setIncludeResponse] = useState(
    !!submission.include_pastoral_response,
  );
  const [freeVisible, setFreeVisible] = useState(
    submission.free_visible == null ? true : !!submission.free_visible,
  );
  const hasResponse = !!submission.pastoral_response?.trim();

  return (
    <section className="mt-6 rounded-lg border border-gold/30 bg-secondary/40 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-ivory">Public Voices</h2>
          <p className="text-xs text-muted-foreground">
            Publish a pastor-edited excerpt to <span className="text-gold">/voices</span>. The
            submitter's identity and full text are never shown.
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${
            isPublished
              ? "border-emerald-500/50 bg-emerald-900/20 text-emerald-200"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          {isPublished ? "Live on Voices" : "Not public"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs uppercase tracking-wide text-muted-foreground">
            Public title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
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
            rows={4}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <label
          className={`flex items-start gap-2 rounded-md border border-border/60 bg-background/40 p-3 text-sm text-ivory ${
            hasResponse ? "" : "opacity-60"
          }`}
        >
          <input
            type="checkbox"
            checked={includeResponse && hasResponse}
            disabled={!hasResponse}
            onChange={(e) => setIncludeResponse(e.target.checked)}
            className="mt-1"
          />
          <span>
            Publish with pastoral response
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {hasResponse
                ? "The most recent pastoral reply will appear alongside the excerpt on /voices."
                : "Send a pastoral reply first to enable this option — or publish without one."}
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 rounded-md border border-border/60 bg-background/40 p-3 text-sm text-ivory">
          <input
            type="checkbox"
            checked={freeVisible}
            onChange={(e) => setFreeVisible(e.target.checked)}
            className="mt-1"
          />
          <span>
            Visible to free / guest members
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Uncheck to reserve this voice for premium members only. Admins and
              pastors always see everything.
            </span>
          </span>
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              onPublish(
                title.trim(),
                excerpt.trim(),
                includeResponse && hasResponse,
                freeVisible,
              )
            }
            disabled={publishing || excerpt.trim().length < 5}
            className="candle-glow inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {isPublished ? "Update public excerpt" : "Publish to Voices"}
          </button>
          {isPublished && (
            <button
              onClick={onUnpublish}
              disabled={publishing}
              className="rounded-md border border-border bg-secondary px-4 py-2 text-sm text-ivory hover:bg-destructive/20"
            >
              Unpublish
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

