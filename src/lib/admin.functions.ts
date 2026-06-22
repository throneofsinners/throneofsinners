import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scanForRisk } from "./risk-keywords";

async function assertPastor(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  const isPastor = roles.includes("pastor") || roles.includes("admin");
  if (!isPastor) throw new Error("Forbidden: pastoral access required.");
  return { roles, isAdmin: roles.includes("admin") };
}

async function writeAudit(actorId: string, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown> = {}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile } = await supabaseAdmin
    .from("profiles").select("email").eq("id", actorId).maybeSingle();
  await supabaseAdmin.from("audit_log").insert({
    actor_id: actorId,
    actor_email: profile?.email ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata as never,
  });
}

// ---- Current user/role ----
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", context.userId);
    const { data: profile } = await supabaseAdmin
      .from("profiles").select("display_name, email, title, membership_tier").eq("id", context.userId).maybeSingle();
    return {
      userId: context.userId,
      roles: (roles ?? []).map((r) => r.role),
      profile: profile ?? null,
    };
  });

// ---- Inbox ----
const inboxFilter = z.object({
  status: z.enum(["received","in_review","being_prayed_for","pastor_assigned","responded","resolved","all"]).default("all"),
  type: z.enum(["confession","prayer","all"]).default("all"),
  category: z.string().trim().max(80).default("all"),
  risk_only: z.boolean().default(false),
  q: z.string().trim().max(200).optional().default(""),
}).default({ status: "all", type: "all", category: "all", risk_only: false, q: "" });

export const listSubmissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => inboxFilter.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    await assertPastor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("submissions")
      .select("id, tracking_token, type, category, status, risk_flagged, contact_name, created_at, updated_at")
      .order("risk_flagged", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.type !== "all") q = q.eq("type", data.type);
    if (data.category && data.category !== "all") q = q.eq("category", data.category);
    if (data.risk_only) q = q.eq("risk_flagged", true);
    if (data.q) q = q.ilike("content", `%${data.q}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertPastor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("submissions")
      .select("category, type")
      .not("category", "is", null)
      .limit(1000);
    const map = new Map<string, { value: string; type: string; count: number }>();
    for (const r of data ?? []) {
      if (!r.category) continue;
      const key = `${r.type}:${r.category}`;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { value: r.category, type: r.type as string, count: 1 });
    }
    return Array.from(map.values()).sort((a,b) => b.count - a.count);
  });

export const getSubmissionDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertPastor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: submission }, { data: responses }, { data: alerts }] = await Promise.all([
      supabaseAdmin.from("submissions").select("*").eq("id", data.id).maybeSingle(),
      supabaseAdmin.from("pastoral_responses").select("*").eq("submission_id", data.id).order("created_at"),
      supabaseAdmin.from("crisis_alerts").select("*").eq("submission_id", data.id).order("created_at", { ascending: false }),
    ]);
    if (!submission) throw new Error("Not found");
    return { submission, responses: responses ?? [], alerts: alerts ?? [] };
  });

const statusEnum = z.enum(["received","in_review","being_prayed_for","pastor_assigned","responded","resolved"]);

export const updateSubmissionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: statusEnum }).parse(d))
  .handler(async ({ context, data }) => {
    await assertPastor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("submissions")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.userId, "submission.status_changed", "submission", data.id, { status: data.status });
    return { ok: true };
  });

const responseInput = z.object({
  submission_id: z.string().uuid(),
  body: z.string().trim().min(2).max(8000),
  scripture_reference: z.string().trim().max(120).optional().nullable(),
  is_internal_note: z.boolean().default(false),
});

export const createPastoralResponse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => responseInput.parse(d))
  .handler(async ({ context, data }) => {
    await assertPastor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles").select("display_name, title").eq("id", context.userId).maybeSingle();
    const display = profile?.title
      ? `${profile.title} ${profile.display_name ?? ""}`.trim()
      : profile?.display_name ?? "A pastor";

    const { data: row, error } = await supabaseAdmin.from("pastoral_responses").insert({
      submission_id: data.submission_id,
      author_id: context.userId,
      author_display_name: display,
      body: data.body,
      scripture_reference: data.scripture_reference || null,
      is_internal_note: data.is_internal_note,
    }).select("id").single();
    if (error) throw new Error(error.message);

    if (!data.is_internal_note) {
      await supabaseAdmin.from("submissions").update({
        status: "responded",
        pastoral_response: data.body,
        responded_at: new Date().toISOString(),
      }).eq("id", data.submission_id);
    }

    await writeAudit(context.userId,
      data.is_internal_note ? "submission.internal_note" : "submission.responded",
      "submission", data.submission_id, { response_id: row?.id });
    return { id: row?.id };
  });

export const acknowledgeCrisisAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertPastor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("crisis_alerts").update({
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: context.userId,
    }).eq("id", data.id);
    await writeAudit(context.userId, "crisis.acknowledged", "crisis_alert", data.id, {});
    return { ok: true };
  });

// ---- Invitations ----
export const listInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { isAdmin } = await assertPastor(context.userId);
    if (!isAdmin) throw new Error("Admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("pastor_invitations")
      .select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

const inviteInput = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  role: z.enum(["pastor","peer_mentor","admin"]).default("pastor"),
});

export const createInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => inviteInput.parse(d))
  .handler(async ({ context, data }) => {
    const { isAdmin } = await assertPastor(context.userId);
    if (!isAdmin) throw new Error("Admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("pastor_invitations").upsert({
      email: data.email, role: data.role, invited_by: context.userId, accepted_at: null,
    }, { onConflict: "email" });
    if (error) throw new Error(error.message);
    await writeAudit(context.userId, "invitation.created", "invitation", null, { email: data.email, role: data.role });
    return { ok: true };
  });

export const revokeInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { isAdmin } = await assertPastor(context.userId);
    if (!isAdmin) throw new Error("Admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("pastor_invitations").delete().eq("id", data.id);
    await writeAudit(context.userId, "invitation.revoked", "invitation", data.id, {});
    return { ok: true };
  });

// ---- Audit ----
export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { isAdmin } = await assertPastor(context.userId);
    if (!isAdmin) throw new Error("Admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("audit_log")
      .select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

// utility: re-scan response body for risk (used client-side preview optional)
export function previewRisk(text: string) {
  return scanForRisk(text);
}
