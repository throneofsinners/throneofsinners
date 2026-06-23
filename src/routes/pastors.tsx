import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Twitter, Instagram, Facebook, Globe } from "lucide-react";
import { PageShell } from "@/components/sanctuary/PageShell";
import { listPastorsPublic } from "@/lib/voices.functions";
import bg from "@/assets/bg-pastors.jpg";

export const Route = createFileRoute("/pastors")({
  head: () => ({
    meta: [
      { title: "Our Pastors — The Throne Room" },
      {
        name: "description",
        content:
          "Meet the pastoral team who shepherd confession, counsel, restoration and prayer at the Throne of Sinners.",
      },
      { property: "og:title", content: "Our Pastors — The Throne Room" },
      {
        property: "og:description",
        content: "Ordained shepherds who carry the sanctuary in prayer and presence.",
      },
    ],
  }),
  component: PastorsPage,
});

function PastorsPage() {
  const fn = useServerFn(listPastorsPublic);
  const { data } = useQuery({ queryKey: ["pastors", "public"], queryFn: () => fn() });
  const pastors = data?.items ?? [];

  return (
    <PageShell
      background={bg}
      wide
      eyebrow="Our Pastors"
      title={<>Shepherds of the Throne.</>}
      subtitle="Ordained pastors and stewards who hold the sanctuary in prayer. Reach out — we are here."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pastors.map((p) => (
          <article
            key={p.id}
            className="altar-card flex flex-col gap-4 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold bg-background/40 font-serif text-2xl text-gold">
                {p.photo_url ? (
                  <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(p.display_name)
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-xl leading-tight text-ivory">
                  {p.display_name}
                </h2>
                {p.title && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-gold/90">
                    {p.title}
                  </p>
                )}
              </div>
            </div>
            {p.bio && (
              <p className="text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
            )}
            <ul className="mt-auto flex flex-wrap items-center gap-3 text-xs text-ivory/80">
              {p.twitter && (
                <li>
                  <a className="inline-flex items-center gap-1.5 hover:text-gold" href={socialUrl("twitter", p.twitter)} target="_blank" rel="noreferrer">
                    <Twitter className="h-3.5 w-3.5" /> Twitter
                  </a>
                </li>
              )}
              {p.instagram && (
                <li>
                  <a className="inline-flex items-center gap-1.5 hover:text-gold" href={socialUrl("instagram", p.instagram)} target="_blank" rel="noreferrer">
                    <Instagram className="h-3.5 w-3.5" /> Instagram
                  </a>
                </li>
              )}
              {p.facebook && (
                <li>
                  <a className="inline-flex items-center gap-1.5 hover:text-gold" href={socialUrl("facebook", p.facebook)} target="_blank" rel="noreferrer">
                    <Facebook className="h-3.5 w-3.5" /> Facebook
                  </a>
                </li>
              )}
              {p.website && (
                <li>
                  <a className="inline-flex items-center gap-1.5 hover:text-gold" href={p.website} target="_blank" rel="noreferrer">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                </li>
              )}
            </ul>
          </article>
        ))}
      </div>

      <p className="mx-auto mt-12 max-w-xl text-center text-sm text-muted-foreground">
        Premium members may write to a pastor directly from their dashboard.
      </p>
    </PageShell>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

function socialUrl(kind: "twitter" | "instagram" | "facebook", handle: string) {
  if (/^https?:\/\//i.test(handle)) return handle;
  const h = handle.replace(/^@/, "");
  if (kind === "twitter") return `https://twitter.com/${h}`;
  if (kind === "instagram") return `https://instagram.com/${h}`;
  return `https://facebook.com/${h}`;
}
