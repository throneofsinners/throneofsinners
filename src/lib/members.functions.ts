import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("admin")) throw new Error("Admin only");
}

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name, membership_tier, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    return data ?? [];
  });

export const setMembershipTier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        user_id: z.string().uuid(),
        tier: z.enum(["free", "regular", "premium"]),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ membership_tier: data.tier })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      action: "membership.tier_changed",
      entity_type: "profile",
      entity_id: data.user_id,
      metadata: { tier: data.tier } as never,
    });
    return { ok: true };
  });

// Pending public-display submissions awaiting pastor approval.
export const listPendingPublic = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", context.userId);
    const list = (roles ?? []).map((r) => r.role);
    if (!list.includes("pastor") && !list.includes("admin"))
      throw new Error("Pastoral access required.");
    const { data } = await supabaseAdmin
      .from("submissions")
      .select(
        "id, type, category, content, public_title, public_excerpt, created_at, tracking_token",
      )
      .eq("display_publicly", true)
      .is("public_approved_at", null)
      .order("created_at", { ascending: false })
      .limit(100);
    return data ?? [];
  });

export const approvePublicSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        public_title: z.string().trim().max(120).optional(),
        public_excerpt: z.string().trim().min(5).max(600),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", context.userId);
    const list = (roles ?? []).map((r) => r.role);
    if (!list.includes("pastor") && !list.includes("admin"))
      throw new Error("Pastoral access required.");
    const { error } = await supabaseAdmin
      .from("submissions")
      .update({
        public_title: data.public_title || null,
        public_excerpt: data.public_excerpt,
        public_approved_at: new Date().toISOString(),
        public_approved_by: context.userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      action: "public.approved",
      entity_type: "submission",
      entity_id: data.id,
      metadata: {} as never,
    });
    return { ok: true };
  });

export const rejectPublicSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", context.userId);
    const list = (roles ?? []).map((r) => r.role);
    if (!list.includes("pastor") && !list.includes("admin"))
      throw new Error("Pastoral access required.");
    await supabaseAdmin
      .from("submissions")
      .update({ display_publicly: false, public_approved_at: null, public_approved_by: null })
      .eq("id", data.id);
    return { ok: true };
  });

// Pastor/admin action from the inbox detail: force-publish a submission
// to /voices, even if the submitter did not opt in. Requires an excerpt
// so no raw content is ever leaked; optional title.
export const publishSubmissionPublic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        public_title: z.string().trim().max(120).optional(),
        public_excerpt: z.string().trim().min(5).max(600),
        include_pastoral_response: z.boolean().optional().default(false),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", context.userId);
    const list = (roles ?? []).map((r) => r.role);
    if (!list.includes("pastor") && !list.includes("admin"))
      throw new Error("Pastoral access required.");
    const { error } = await supabaseAdmin
      .from("submissions")
      .update({
        display_publicly: true,
        public_title: data.public_title || null,
        public_excerpt: data.public_excerpt,
        include_pastoral_response: data.include_pastoral_response,
        public_approved_at: new Date().toISOString(),
        public_approved_by: context.userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      action: "public.published_by_pastor",
      entity_type: "submission",
      entity_id: data.id,
      metadata: { include_pastoral_response: data.include_pastoral_response } as never,
    });
    return { ok: true };
  });

export const unpublishSubmissionPublic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", context.userId);
    const list = (roles ?? []).map((r) => r.role);
    if (!list.includes("pastor") && !list.includes("admin"))
      throw new Error("Pastoral access required.");
    const { error } = await supabaseAdmin
      .from("submissions")
      .update({
        display_publicly: false,
        public_approved_at: null,
        public_approved_by: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      action: "public.unpublished",
      entity_type: "submission",
      entity_id: data.id,
      metadata: {} as never,
    });
    return { ok: true };
  });
