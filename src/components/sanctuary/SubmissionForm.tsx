import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createSubmission } from "@/lib/submissions.functions";
import { ThroneReveal } from "./ThroneReveal";
import { PublicOptIn } from "./PublicOptIn";
import { Loader2 } from "lucide-react";

type Props = {
  type: "confession" | "prayer";
  publicVoiceType?: "confession" | "testimony" | "prayer";
  categories: { value: string; label: string }[];
  intro: string;
  contentLabel: string;
  contentPlaceholder: string;
  submitLabel: string;
  allowPublic?: boolean;
};

export function SubmissionForm({
  type,
  publicVoiceType,
  categories,
  intro,
  contentLabel,
  contentPlaceholder,
  submitLabel,
  allowPublic = true,
}: Props) {
  const submit = useServerFn(createSubmission);
  const [isAnon, setIsAnon] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ token: string; flagged: boolean } | null>(
    null,
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const content = String(form.get("content") ?? "");
    const category = String(form.get("category") ?? "");
    const contact_email = String(form.get("contact_email") ?? "");
    const contact_name = String(form.get("contact_name") ?? "");
    const display_publicly = form.get("display_publicly") === "on";
    const public_title = String(form.get("public_title") ?? "");
    const public_excerpt = String(form.get("public_excerpt") ?? "");

    if (content.trim().length < 10) {
      setError("Please share a little more — at least a few sentences.");
      return;
    }

    setPending(true);
    try {
      const res = await submit({
        data: {
          type,
          content,
          category: category || null,
          contact_email: isAnon ? "" : contact_email,
          contact_name: isAnon ? "" : contact_name,
          is_anonymous: isAnon,
          display_publicly,
          public_title,
          public_excerpt,
        },
      });
      setResult({ token: res.tracking_token, flagged: res.risk_flagged });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  if (result) {
    return (
      <ThroneReveal type={type} token={result.token} flagged={result.flagged} />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <p className="text-muted-foreground">{intro}</p>

      {categories.length > 0 && (
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ivory">
            Topic
          </label>
          <select
            id="category"
            name="category"
            className="mt-2 w-full rounded-md border border-border bg-input px-3 py-2 text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
            defaultValue=""
          >
            <option value="">Choose a topic</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-ivory">
          {contentLabel}
        </label>
        <textarea
          id="content"
          name="content"
          required
          minLength={10}
          maxLength={8000}
          rows={9}
          placeholder={contentPlaceholder}
          className="mt-2 w-full rounded-md border border-border bg-input px-3 py-3 font-serif text-lg leading-relaxed text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Encrypted in transit. No one else sees this except pastoral staff.
        </p>
      </div>

      <fieldset className="rounded-md border border-border/70 p-4">
        <legend className="px-2 text-sm text-muted-foreground">
          How would you like to share this?
        </legend>
        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm text-ivory">
            <input
              type="radio"
              name="identity"
              checked={isAnon}
              onChange={() => setIsAnon(true)}
              className="mt-1 accent-[oklch(0.78_0.13_86)]"
            />
            <span>
              <span className="font-medium">Anonymously</span>
              <span className="block text-muted-foreground">
                We will not know who you are. You'll receive a tracking code to
                read pastoral responses.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-ivory">
            <input
              type="radio"
              name="identity"
              checked={!isAnon}
              onChange={() => setIsAnon(false)}
              className="mt-1 accent-[oklch(0.78_0.13_86)]"
            />
            <span>
              <span className="font-medium">With my contact info</span>
              <span className="block text-muted-foreground">
                A pastor may reach out to you directly.
              </span>
            </span>
          </label>
        </div>

        {!isAnon && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact_name" className="block text-xs uppercase tracking-wide text-muted-foreground">
                Name
              </label>
              <input
                id="contact_name"
                name="contact_name"
                type="text"
                maxLength={120}
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
            <div>
              <label htmlFor="contact_email" className="block text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                maxLength={255}
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
          </div>
        )}
      </fieldset>

      {allowPublic && <PublicOptIn type={publicVoiceType ?? type} />}

      {error && (
        <p role="alert" className="text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="candle-glow inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-serif text-lg text-primary-foreground transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {pending ? "Lifting it up…" : submitLabel}
      </button>
    </form>
  );
}
