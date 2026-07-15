import { useState, type FormEvent, type ChangeEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createSubmission, uploadSubmissionPhoto } from "@/lib/submissions.functions";
import { ThroneReveal } from "./ThroneReveal";
import { PublicOptIn } from "./PublicOptIn";
import { Loader2, ImagePlus, X } from "lucide-react";

type Props = {
  type: "confession" | "prayer";
  publicVoiceType?: "confession" | "testimony" | "prayer" | "partner_request";
  categories: { value: string; label: string }[];
  intro: string;
  contentLabel: string;
  contentPlaceholder: string;
  submitLabel: string;
  allowPublic?: boolean;
  showLocation?: boolean;
  locationRequired?: boolean;
  locationLabel?: string;
  locationPlaceholder?: string;
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
  showLocation = false,
  locationRequired = false,
  locationLabel = "Location (city, state / country)",
  locationPlaceholder = "e.g. Austin, TX — or just 'Southeast USA'",
}: Props) {
  const submit = useServerFn(createSubmission);
  const uploadPhoto = useServerFn(uploadSubmissionPhoto);
  const [isAnon, setIsAnon] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<
    { id: string; name: string; preview: string; path?: string; uploading: boolean; error?: string }[]
  >([]);
  const [result, setResult] = useState<{ token: string; flagged: boolean } | null>(
    null,
  );

  async function onPhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) {
      if (photos.length >= 5) break;
      if (file.size > 6 * 1024 * 1024) {
        setError(`"${file.name}" is over 6 MB — please pick a smaller image.`);
        continue;
      }
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      setPhotos((p) => [...p, { id, name: file.name, preview, uploading: true }]);
      try {
        const buf = await file.arrayBuffer();
        const b64 = btoa(
          new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), ""),
        );
        const res = await uploadPhoto({
          data: { filename: file.name, content_type: file.type || "image/jpeg", data_base64: b64 },
        });
        setPhotos((p) =>
          p.map((x) => (x.id === id ? { ...x, path: res.path, uploading: false } : x)),
        );
      } catch (err) {
        setPhotos((p) =>
          p.map((x) =>
            x.id === id
              ? { ...x, uploading: false, error: err instanceof Error ? err.message : "Upload failed" }
              : x,
          ),
        );
      }
    }
  }

  function removePhoto(id: string) {
    setPhotos((p) => p.filter((x) => x.id !== id));
  }

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
    const location = String(form.get("location") ?? "").trim();

    if (content.trim().length < 10) {
      setError("Please share a little more — at least a few sentences.");
      return;
    }
    if (showLocation && locationRequired && location.length < 2) {
      setError("Please add a location so we can match you well.");
      return;
    }
    if (photos.some((p) => p.uploading)) {
      setError("Please wait — your photos are still uploading.");
      return;
    }

    setPending(true);
    try {
      const image_paths = photos.map((p) => p.path).filter((p): p is string => !!p);
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
          image_paths,
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

      <fieldset className="rounded-md border border-border/70 p-4">
        <legend className="px-2 text-sm text-muted-foreground">
          Photos (optional, up to 5)
        </legend>
        <p className="text-xs text-muted-foreground">
          Attach screenshots, prayer requests on paper, or images that help the
          pastors understand. Only ordained pastoral staff will ever see these.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative h-24 w-24 overflow-hidden rounded-md border border-border bg-background"
            >
              <img src={p.preview} alt={p.name} className="h-full w-full object-cover" />
              {p.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-5 w-5 animate-spin text-gold" />
                </div>
              )}
              {p.error && (
                <div className="absolute inset-x-0 bottom-0 bg-red-900/80 px-1 py-0.5 text-[10px] text-red-100">
                  {p.error}
                </div>
              )}
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-ivory hover:bg-red-700"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-background/40 text-xs text-muted-foreground hover:border-gold/40 hover:text-gold">
              <ImagePlus className="h-5 w-5" />
              Add photo
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPhotoSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
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
