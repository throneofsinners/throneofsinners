import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/sanctuary/PageShell";
import { listPastorsPublic } from "@/lib/voices.functions";
import { sendPastorMessage } from "@/lib/pastor-messages.functions";
import { getMyRoles } from "@/lib/admin.functions";
import bg from "@/assets/bg-pastors.jpg";

export const Route = createFileRoute("/_authenticated/contact-pastors")({
  head: () => ({
    meta: [{ title: "Contact Pastors — The Throne Room" }, { name: "robots", content: "noindex" }],
  }),
  component: ContactPastorsPage,
});

function ContactPastorsPage() {
  const meFn = useServerFn(getMyRoles);
  const pastorsFn = useServerFn(listPastorsPublic);
  const sendFn = useServerFn(sendPastorMessage);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const { data: pastors } = useQuery({
    queryKey: ["pastors", "public"],
    queryFn: () => pastorsFn(),
  });

  const tier = me?.profile?.membership_tier;
  const isPremium = tier === "premium";

  const [pastorId, setPastorId] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pastorId && pastors?.items?.[0]) setPastorId(pastors.items[0].id);
  }, [pastors, pastorId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    try {
      await sendFn({
        data: {
          pastor_id: pastorId,
          subject: String(form.get("subject") ?? ""),
          body: String(form.get("body") ?? ""),
        },
      });
      setSent(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the message.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell
      background={bg}
      eyebrow="Premium · Direct Contact"
      title={<>Write to a pastor.</>}
      subtitle="A direct, confidential line to the pastoral team — reserved for premium members."
    >
      {!isPremium ? (
        <div className="rounded-xl border border-gold/30 bg-card/70 p-8 text-center shadow-engraved">
          <ShieldCheck className="mx-auto h-5 w-5 text-gold" aria-hidden />
          <h2 className="mt-3 font-serif text-2xl text-ivory">
            This door is reserved for premium members.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Premium members may contact pastors directly and read anonymous
            confessions with pastoral responses. Reach out to an admin to upgrade
            your membership.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="text-xs uppercase tracking-[0.22em] text-gold/80 hover:text-gold"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : sent ? (
        <div className="altar-card p-8 text-center">
          <h2 className="font-serif text-2xl text-ivory">Your message has been delivered.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A pastor will respond as soon as they are able.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 inline-flex items-center justify-center rounded-md border border-gold/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ivory hover:border-gold hover:text-gold"
          >
            Write another
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="pastor" className="block text-sm font-medium text-ivory">
              Pastor
            </label>
            <select
              id="pastor"
              value={pastorId}
              onChange={(e) => setPastorId(e.target.value)}
              className="mt-2 w-full rounded-md border border-border bg-input px-3 py-2 text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
            >
              {pastors?.items?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                  {p.title ? ` — ${p.title}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-ivory">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              maxLength={160}
              className="mt-2 w-full rounded-md border border-border bg-input px-3 py-2 text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-ivory">
              Your message
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={9}
              minLength={5}
              maxLength={8000}
              className="mt-2 w-full rounded-md border border-border bg-input px-3 py-3 font-serif text-lg leading-relaxed text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive-foreground">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !pastorId}
            className="candle-glow inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-serif text-lg text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Sending…" : "Send to the pastor"}
          </button>
        </form>
      )}
    </PageShell>
  );
}
