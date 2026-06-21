import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/sanctuary/PageShell";
import { SubmissionForm } from "@/components/sanctuary/SubmissionForm";

export const Route = createFileRoute("/counsel")({
  head: () => ({
    meta: [
      { title: "The Counsel — The Throne Room" },
      {
        name: "description",
        content:
          "Request pastoral counsel for marriage, family, grief, addiction or spiritual struggle. A pastor will be assigned to walk with you.",
      },
      { property: "og:title", content: "The Counsel — The Throne Room" },
      {
        property: "og:description",
        content:
          "Pastor-led counsel for the seasons that ask more than we can carry alone.",
      },
    ],
  }),
  component: CounselPage,
});

const CATEGORIES = [
  { value: "marriage", label: "Marriage & relationship" },
  { value: "family", label: "Family & parenting" },
  { value: "grief", label: "Grief & loss" },
  { value: "addiction", label: "Addiction & recovery" },
  { value: "anxiety", label: "Anxiety, fear, depression" },
  { value: "vocation", label: "Vocation & calling" },
  { value: "spiritual", label: "Spiritual direction" },
  { value: "other", label: "Something else" },
];

function CounselPage() {
  return (
    <PageShell
      eyebrow="The Counsel"
      title={<>Wisdom for the road ahead.</>}
      subtitle="Share what you're walking through. A pastor will reach out to schedule a confidential conversation — in person, by phone, or by video."
    >
      <SubmissionForm
        type="prayer"
        categories={CATEGORIES}
        intro="Tell us only what you're comfortable sharing here. The deeper conversation will happen with your pastor."
        contentLabel="What would you like counsel about?"
        contentPlaceholder="I'd like to talk about…"
        submitLabel="Request pastoral counsel"
      />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have a tracking code?{" "}
        <Link to="/lookup" className="text-gold hover:underline">
          Open your scroll
        </Link>
      </p>
    </PageShell>
  );
}
