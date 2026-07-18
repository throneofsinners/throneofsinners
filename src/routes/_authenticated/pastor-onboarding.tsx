import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getMyPastorProfile, upsertMyPastorProfile } from "@/lib/pastors.functions";
import { getMyRoles } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/pastor-onboarding")({
  head: () => ({ meta: [{ title: "Pastor Onboarding" }, { name: "robots", content: "noindex" }] }),
  component: PastorOnboarding,
});

type Form = {
  display_name: string;
  title: string;
  bio: string;
  photo_url: string;
  email: string;
  phone: string;
  twitter: string;
  instagram: string;
  facebook: string;
  website: string;
  is_visible: boolean;
};

const EMPTY: Form = {
  display_name: "",
  title: "",
  bio: "",
  photo_url: "",
  email: "",
  phone: "",
  twitter: "",
  instagram: "",
  facebook: "",
  website: "",
  is_visible: false,
};

function PastorOnboarding() {
  const navigate = useNavigate();
  const rolesFn = useServerFn(getMyRoles);
  const getFn = useServerFn(getMyPastorProfile);
  const saveFn = useServerFn(upsertMyPastorProfile);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => rolesFn() });
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-pastor-profile"],
    queryFn: () => getFn(),
  });

  const [form, setForm] = useState<Form>(EMPTY);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      title: profile.title ?? "",
      bio: profile.bio ?? "",
      photo_url: profile.photo_url ?? "",
      email: profile.email ?? me?.profile?.email ?? "",
      phone: profile.phone ?? "",
      twitter: profile.twitter ?? "",
      instagram: profile.instagram ?? "",
      facebook: profile.facebook ?? "",
      website: profile.website ?? "",
      is_visible: !!profile.is_visible,
    });
  }, [profile, me]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: form }),
    onSuccess: () => navigate({ to: "/dashboard" }),
  });

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const roles = me?.roles ?? [];
  const isPastor = roles.includes("pastor") || roles.includes("admin");

  if (!isPastor) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-ivory">This page is for pastoral staff.</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-gold hover:underline">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Pastor Onboarding</p>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Complete your shepherd's profile.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This information appears on the public <Link to="/pastors" className="text-gold hover:underline">Pastors</Link> page
        once you set your profile to visible. Contact details are only shown to admins and fellow pastors.
      </p>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
          className="mt-8 space-y-5 rounded-lg border border-border bg-secondary/40 p-6"
        >
          <Row label="Display name *">
            <Input value={form.display_name} onChange={(v) => set("display_name", v)} required />
          </Row>
          <Row label="Title / role">
            <Input value={form.title} onChange={(v) => set("title", v)} placeholder="Pastor, Elder, Chaplain…" />
          </Row>
          <Row label="Short bio">
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={5}
              maxLength={2000}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ivory"
              placeholder="How you came to shepherd, what you carry in prayer, how you serve."
            />
          </Row>
          <Row label="Photo URL">
            <Input value={form.photo_url} onChange={(v) => set("photo_url", v)} placeholder="https://…" />
          </Row>

          <div className="grid gap-4 sm:grid-cols-2">
            <Row label="Contact email">
              <Input value={form.email} onChange={(v) => set("email", v)} type="email" />
            </Row>
            <Row label="Contact phone">
              <Input value={form.phone} onChange={(v) => set("phone", v)} />
            </Row>
            <Row label="Twitter / X">
              <Input value={form.twitter} onChange={(v) => set("twitter", v)} placeholder="@handle or URL" />
            </Row>
            <Row label="Instagram">
              <Input value={form.instagram} onChange={(v) => set("instagram", v)} />
            </Row>
            <Row label="Facebook">
              <Input value={form.facebook} onChange={(v) => set("facebook", v)} />
            </Row>
            <Row label="Website">
              <Input value={form.website} onChange={(v) => set("website", v)} />
            </Row>
          </div>

          <label className="flex items-center gap-2 rounded-md border border-gold/25 bg-background/40 p-3 text-sm text-ivory">
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={(e) => set("is_visible", e.target.checked)}
            />
            Show me on the public Pastors page
          </label>

          {save.error && (
            <p className="text-sm text-red-400">{(save.error as Error).message}</p>
          )}
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-ivory">
              ← Back
            </Link>
            <button
              type="submit"
              disabled={save.isPending || form.display_name.trim().length < 2}
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : profile ? "Save profile" : "Complete onboarding"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input(props: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type={props.type ?? "text"}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      required={props.required}
      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ivory focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
    />
  );
}
