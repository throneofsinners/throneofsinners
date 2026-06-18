import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateTrackingToken, isValidToken, normalizeToken } from "./token";
import { scanForRisk } from "./risk-keywords";

const submissionInput = z.object({
  type: z.enum(["confession", "prayer"]),
  category: z.string().trim().max(80).optional().nullable(),
  content: z.string().trim().min(10, "Please share a little more.").max(8000),
  contact_email: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .max(255)
    .optional()
    .or(z.literal("")),
  contact_name: z.string().trim().max(120).optional().or(z.literal("")),
  is_anonymous: z.boolean().default(true),
});

export type SubmissionInput = z.infer<typeof submissionInput>;

export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((input) => submissionInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const risk = scanForRisk(data.content);
    const token = generateTrackingToken();

    const { data: row, error } = await supabaseAdmin
      .from("submissions")
      .insert({
        tracking_token: token,
        type: data.type,
        category: data.category || null,
        content: data.content,
        contact_email: data.contact_email ? data.contact_email : null,
        contact_name: data.contact_name ? data.contact_name : null,
        is_anonymous: data.is_anonymous,
        risk_flagged: risk.flagged,
        risk_keywords: risk.matched.length ? risk.matched : null,
      })
      .select("id, tracking_token, type, status, created_at")
      .single();

    if (error) throw new Error(error.message);

    if (risk.flagged && row) {
      await supabaseAdmin.from("crisis_alerts").insert({
        submission_id: row.id,
        severity: "high",
        matched_keywords: risk.matched,
      });
    }

    return {
      tracking_token: row!.tracking_token,
      type: row!.type,
      status: row!.status,
      created_at: row!.created_at,
      risk_flagged: risk.flagged,
    };
  });

const lookupInput = z.object({
  token: z.string().transform(normalizeToken).refine(isValidToken, {
    message: "That tracking code doesn't look right.",
  }),
});

export const getSubmissionByToken = createServerFn({ method: "POST" })
  .inputValidator((input) => lookupInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("submissions")
      .select(
        "tracking_token, type, category, status, pastoral_response, responded_at, created_at"
      )
      .eq("tracking_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
