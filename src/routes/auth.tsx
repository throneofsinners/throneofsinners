import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pastor Sign In — The Throne Room" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName || undefined },
          },
        });
        if (error) throw error;
        setInfo(
          "Account created. If email confirmation is required, check your inbox. Otherwise sign in below.",
        );
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Sanctuary stewards</p>
      <h1 className="mt-2 font-serif text-3xl text-ivory">
        {mode === "signin" ? "Enter the inner court" : "Accept your invitation"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        For pastors, admins, and peer mentors only. Public submissions remain anonymous and require
        no account.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <label className="block">
            <span className="text-sm text-ivory">Display name</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-secondary/60 px-3 py-2 text-ivory"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={120}
            />
          </label>
        )}
        <label className="block">
          <span className="text-sm text-ivory">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-border bg-secondary/60 px-3 py-2 text-ivory"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ivory">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="mt-1 w-full rounded-md border border-border bg-secondary/60 px-3 py-2 text-ivory"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {info && <p className="text-sm text-gold">{info}</p>}

        <button
          disabled={loading}
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setInfo(null);
        }}
        className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:text-ivory hover:underline"
      >
        {mode === "signin"
          ? "First time? Use your invited email to create an account."
          : "Already have an account? Sign in."}
      </button>

      <Link
        to="/"
        className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-ivory"
      >
        Return to the sanctuary
      </Link>
    </main>
  );
}
