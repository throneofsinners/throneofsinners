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
};

export const listPublicVoices = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z
      .object({ limit: z.number().int().min(1).max(100).default(50) })
      .default({ limit: 50 })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: rows, error } = await supabase
      .from("public_voices")
      .select("id, type, category, title, excerpt, image_paths, approved_at, pastoral_response")
      .order("approved_at", { ascending: false })
      .limit(data.limit);
    if (error) return { items: [] as PublicVoice[], error: error.message };

    // Sign photo URLs server-side (bucket is private). Rows come from the
    // public_voices view which only exposes approved, opted-in submissions.
    const allPaths = Array.from(
      new Set(
        (rows ?? []).flatMap(
          (r) => ((r as { image_paths?: string[] | null }).image_paths ?? []) as string[],
        ),
      ),
    );
    const signedMap = new Map<string, string>();
    if (allPaths.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: signed } = await supabaseAdmin.storage
        .from("submission-photos")
        .createSignedUrls(allPaths, 60 * 60);
      (signed ?? []).forEach((s) => {
        if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl);
      });
    }

    const items: PublicVoice[] = (rows ?? []).map((r) => {
      const paths = ((r as { image_paths?: string[] | null }).image_paths ?? []) as string[];
      return {
        id: r.id as string,
        type: r.type as string,
        category: (r.category as string | null) ?? null,
        title: r.title as string,
        excerpt: r.excerpt as string,
        approved_at: (r.approved_at as string | null) ?? null,
        image_urls: paths
          .map((p) => signedMap.get(p))
          .filter((u): u is string => !!u),
        pastoral_response:
          ((r as { pastoral_response?: string | null }).pastoral_response ?? null) as string | null,
      };
    });
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
