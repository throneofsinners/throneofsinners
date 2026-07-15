import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type PublicVoice = {
  id: string;
  type: string;
  category: string | null;
  title: string;
  excerpt: string;
  approved_at: string | null;
  image_urls: string[];
  pastoral_response: string | null;
  location: string | null;
  free_visible: boolean;
};

export const listPublicVoices = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z
      .object({ limit: z.number().int().min(1).max(200).default(100) })
      .default({ limit: 100 })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    // Read through the trusted server-only admin client. The public_voices
    // view already filters to display_publicly=true + pastor-approved rows and
    // only exposes safe columns (title, excerpt, category, image paths,
    // optional pastoral response, location, free-tier flag).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("public_voices" as never)
      .select(
        "id, type, category, title, excerpt, image_paths, approved_at, pastoral_response, location, free_visible",
      )
      .order("approved_at", { ascending: false })
      .limit(data.limit);
    if (error) return { items: [] as PublicVoice[], error: error.message };

    type Row = {
      id: string;
      type: string;
      category: string | null;
      title: string;
      excerpt: string;
      image_paths: string[] | null;
      approved_at: string | null;
      pastoral_response: string | null;
      location: string | null;
      free_visible: boolean | null;
    };
    const typed = (rows ?? []) as unknown as Row[];

    // Sign photo URLs server-side (bucket is private).
    const allPaths = Array.from(
      new Set(typed.flatMap((r) => r.image_paths ?? [])),
    );
    const signedMap = new Map<string, string>();
    if (allPaths.length > 0) {
      const { data: signed } = await supabaseAdmin.storage
        .from("submission-photos")
        .createSignedUrls(allPaths, 60 * 60);
      (signed ?? []).forEach((s) => {
        if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl);
      });
    }

    const items: PublicVoice[] = typed.map((r) => ({
      id: r.id,
      type: r.type,
      category: r.category,
      title: r.title,
      excerpt: r.excerpt,
      approved_at: r.approved_at,
      image_urls: (r.image_paths ?? [])
        .map((p) => signedMap.get(p))
        .filter((u): u is string => !!u),
      pastoral_response: r.pastoral_response,
      location: r.location,
      free_visible: r.free_visible ?? true,
    }));
    return { items, error: null as string | null };
  });

export const listPastorsPublic = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("public_pastors" as never)
    .select(
      "id, display_name, title, bio, photo_url, twitter, instagram, facebook, website",
    )
    .order("sort_order", { ascending: true });
  if (error) return { items: [] as PastorPublic[], error: error.message };
  return { items: (data ?? []) as PastorPublic[], error: null as string | null };
});

export type PastorPublic = {
  id: string;
  display_name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
};
