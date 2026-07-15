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
  display_publicly: z.boolean().default(false),
  public_title: z.string().trim().max(120).optional().or(z.literal("")),
  public_excerpt: z.string().trim().max(600).optional().or(z.literal("")),
  image_paths: z.array(z.string().max(500)).max(5).default([]),
  location: z.string().trim().max(160).optional().or(z.literal("")),
});

export type SubmissionInput = z.infer<typeof submissionInput>;

export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((input) => submissionInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
        display_publicly: data.display_publicly,
        public_title:
          data.display_publicly && data.public_title ? data.public_title : null,
        public_excerpt:
          data.display_publicly && data.public_excerpt ? data.public_excerpt : null,
        risk_flagged: risk.flagged,
        risk_keywords: risk.matched.length ? risk.matched : null,
        image_paths: data.image_paths ?? [],
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

// Upload a photo attachment for a pending submission. Returns the storage path
// which the client then sends along with createSubmission.
const uploadPhotoInput = z.object({
  filename: z.string().trim().min(1).max(160),
  content_type: z.string().trim().min(3).max(80),
  data_base64: z.string().min(4).max(8_500_000), // ~6MB binary
});

export const uploadSubmissionPhoto = createServerFn({ method: "POST" })
  .inputValidator((input) => uploadPhotoInput.parse(input))
  .handler(async ({ data }) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/gif"];
    if (!allowed.includes(data.content_type)) {
      throw new Error("Unsupported image type. Use JPG, PNG, WEBP, GIF or HEIC.");
    }
    const buf = Buffer.from(data.data_base64, "base64");
    if (buf.byteLength > 6 * 1024 * 1024) {
      throw new Error("Image is too large — please keep each photo under 6 MB.");
    }
    const ext = (data.filename.split(".").pop() ?? "jpg").toLowerCase().slice(0, 8);
    const key = `incoming/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("submission-photos")
      .upload(key, buf, { contentType: data.content_type, upsert: false });
    if (error) throw new Error(error.message);
    return { path: key };
  });


const lookupInput = z.object({
  token: z.string().transform(normalizeToken).refine(isValidToken, {
    message: "That tracking code doesn't look right.",
  }),
});

export const getSubmissionByToken = createServerFn({ method: "POST" })
  .inputValidator((input) => lookupInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("submissions")
      .select(
        "id, tracking_token, type, category, status, content, pastoral_response, responded_at, created_at",
      )
      .eq("tracking_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    const { data: responses } = await supabaseAdmin
      .from("pastoral_responses")
      .select("id, body, scripture_reference, author_display_name, created_at")
      .eq("submission_id", row.id)
      .eq("is_internal_note", false)
      .order("created_at", { ascending: true });

    return { ...row, responses: responses ?? [] };
  });
