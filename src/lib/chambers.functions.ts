import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scanForRisk } from "./risk-keywords";

async function getRoles(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}

export const listChambers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: chambers } = await supabaseAdmin
      .from("peer_chambers")
      .select("id, topic, description, status, capacity, created_at")
      .neq("status", "archived")
      .order("created_at", { ascending: false });
    const { data: memberships } = await supabaseAdmin
      .from("peer_chamber_members").select("chamber_id, user_id");
    const counts = new Map<string, number>();
    const mine = new Set<string>();
    for (const m of memberships ?? []) {
      counts.set(m.chamber_id, (counts.get(m.chamber_id) ?? 0) + 1);
      if (m.user_id === context.userId) mine.add(m.chamber_id);
    }
    return (chambers ?? []).map((c) => ({
      ...c,
      member_count: counts.get(c.id) ?? 0,
      joined: mine.has(c.id),
    }));
  });

const createChamberInput = z.object({
  topic: z.string().trim().min(3).max(120),
  description: z.string().trim().max(800).optional().nullable(),
  capacity: z.number().int().min(2).max(20).default(6),
});

export const createChamber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => createChamberInput.parse(d))
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (!roles.includes("pastor") && !roles.includes("admin")) {
      throw new Error("Only pastors can open new chambers.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("peer_chambers").insert({
      topic: data.topic,
      description: data.description || null,
      capacity: data.capacity,
      steward_id: context.userId,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

const joinInput = z.object({
  chamber_id: z.string().uuid(),
  pseudonym: z.string().trim().min(2).max(40),
});

export const joinChamber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => joinInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: chamber } = await supabaseAdmin
      .from("peer_chambers").select("capacity, status").eq("id", data.chamber_id).maybeSingle();
    if (!chamber) throw new Error("Chamber not found.");
    if (chamber.status !== "open") throw new Error("This chamber is not open.");
    const { count } = await supabaseAdmin.from("peer_chamber_members")
      .select("id", { count: "exact", head: true }).eq("chamber_id", data.chamber_id);
    if ((count ?? 0) >= chamber.capacity) throw new Error("Chamber is full.");

    const { error } = await supabaseAdmin.from("peer_chamber_members").upsert({
      chamber_id: data.chamber_id,
      user_id: context.userId,
      pseudonym: data.pseudonym,
    }, { onConflict: "chamber_id,user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const leaveChamber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ chamber_id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("peer_chamber_members").delete()
      .eq("chamber_id", data.chamber_id).eq("user_id", context.userId);
    return { ok: true };
  });

export const getChamber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const roles = await getRoles(context.userId);
    const isPastoral = roles.includes("pastor") || roles.includes("admin");

    const { data: chamber } = await supabaseAdmin
      .from("peer_chambers").select("*").eq("id", data.id).maybeSingle();
    if (!chamber) throw new Error("Chamber not found.");

    const { data: members } = await supabaseAdmin
      .from("peer_chamber_members").select("id, pseudonym, role, user_id, joined_at")
      .eq("chamber_id", data.id).order("joined_at");
    const me = (members ?? []).find((m) => m.user_id === context.userId);
    if (!me && !isPastoral) {
      return {
        chamber, members: [], messages: [],
        isMember: false, isPastoral, me: null,
      };
    }
    const { data: messages } = await supabaseAdmin
      .from("peer_chamber_messages")
      .select("id, body, pseudonym, author_id, created_at, risk_flagged")
      .eq("chamber_id", data.id).order("created_at").limit(200);

    // Strip author_id from response unless pastoral
    const sanitized = (messages ?? []).map((m) => ({
      id: m.id, body: m.body, pseudonym: m.pseudonym,
      created_at: m.created_at, risk_flagged: m.risk_flagged,
      is_mine: m.author_id === context.userId,
    }));
    const sanitizedMembers = (members ?? []).map((m) => ({
      id: m.id, pseudonym: m.pseudonym, role: m.role,
      is_me: m.user_id === context.userId, joined_at: m.joined_at,
    }));
    return {
      chamber, members: sanitizedMembers, messages: sanitized,
      isMember: !!me, isPastoral, me: me ?? null,
    };
  });

const postMessageInput = z.object({
  chamber_id: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

export const postChamberMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => postMessageInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: me } = await supabaseAdmin
      .from("peer_chamber_members").select("pseudonym")
      .eq("chamber_id", data.chamber_id).eq("user_id", context.userId).maybeSingle();
    if (!me) throw new Error("Join this chamber first.");
    const risk = scanForRisk(data.body);
    const { error } = await supabaseAdmin.from("peer_chamber_messages").insert({
      chamber_id: data.chamber_id,
      author_id: context.userId,
      pseudonym: me.pseudonym,
      body: data.body,
      risk_flagged: risk.flagged,
      risk_keywords: risk.matched.length ? risk.matched : null,
    });
    if (error) throw new Error(error.message);
    if (risk.flagged) {
      await supabaseAdmin.from("crisis_alerts").insert({
        submission_id: null,
        severity: "high",
        matched_keywords: risk.matched,
      });
    }
    return { ok: true, risk_flagged: risk.flagged };
  });
