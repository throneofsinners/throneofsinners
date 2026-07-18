import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertPastor(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("pastor") && !roles.includes("admin")) {
    throw new Error("Forbidden: pastoral access required.");
  }
  return roles;
}

export const getMyPastorProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertPastor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("pastors")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    return data ?? null;
  });

const upsertInput = z.object({
  display_name: z.string().trim().min(2).max(120),
  title: z.string().trim().max(120).optional().nullable(),
  bio: z.string().trim().max(2000).optional().nullable(),
  photo_url: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(60).optional().nullable(),
  twitter: z.string().trim().max(120).optional().nullable(),
  instagram: z.string().trim().max(120).optional().nullable(),
  facebook: z.string().trim().max(120).optional().nullable(),
  website: z.string().trim().max(500).optional().nullable(),
  is_visible: z.boolean().default(false),
});

export const upsertMyPastorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => upsertInput.parse(d))
  .handler(async ({ context, data }) => {
    await assertPastor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      user_id: context.userId,
      display_name: data.display_name,
      title: data.title || null,
      bio: data.bio || null,
      photo_url: data.photo_url || null,
      email: data.email || null,
      phone: data.phone || null,
      twitter: data.twitter || null,
      instagram: data.instagram || null,
      facebook: data.facebook || null,
      website: data.website || null,
      is_visible: data.is_visible,
      onboarding_completed_at: new Date().toISOString(),
    };
    const { data: existing } = await supabaseAdmin
      .from("pastors")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabaseAdmin
        .from("pastors")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { id: existing.id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("pastors")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const recommendPartnerMatches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ submission_id: z.string().uuid(), limit: z.number().int().min(1).max(25).default(8) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertPastor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("recommend_partner_matches", {
      _submission_id: data.submission_id,
      _limit: data.limit,
    });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
