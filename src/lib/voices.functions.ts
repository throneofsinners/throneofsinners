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
      .select("id, type, category, title, excerpt, approved_at")
      .order("approved_at", { ascending: false })
      .limit(data.limit);
    if (error) return { items: [], error: error.message };
    return { items: rows ?? [], error: null as string | null };
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
