import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const sendInput = z.object({
  pastor_id: z.string().uuid(),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  body: z.string().trim().min(5).max(8000),
});

export const sendPastorMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => sendInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("membership_tier")
      .eq("id", context.userId)
      .maybeSingle();
    if (profile?.membership_tier !== "premium") {
      throw new Error("Premium membership required to contact pastors directly.");
    }
    const { error } = await supabaseAdmin.from("pastor_messages").insert({
      pastor_id: data.pastor_id,
      sender_id: context.userId,
      subject: data.subject || null,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyPastorMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("pastor_messages")
      .select("id, pastor_id, subject, body, created_at, pastors(display_name, title)")
      .eq("sender_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return data ?? [];
  });

// Premium-only: read anonymous confessions + pastoral responses (read-only).
export const listAnonymousFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("membership_tier")
      .eq("id", context.userId)
      .maybeSingle();
    if (profile?.membership_tier !== "premium") {
      throw new Error("Premium membership required.");
    }
    const { data: subs } = await supabaseAdmin
      .from("submissions")
      .select(
        "id, type, category, content, pastoral_response, responded_at, created_at, status",
      )
      .eq("is_anonymous", true)
      .eq("status", "responded")
      .order("responded_at", { ascending: false })
      .limit(100);
    return subs ?? [];
  });
