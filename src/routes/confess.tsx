import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/sanctuary/PageShell";
import { SubmissionForm } from "@/components/sanctuary/SubmissionForm";
import bg from "@/assets/bg-confess.jpg";

export const Route = createFileRoute("/confess")({
  head: () => ({
    meta: [
      { title: "Confession — The Throne Room" },
      {
        name: "description",
        content:
          "Lay it down in confidence. Confessions are read only by pastoral staff and may be made anonymously.",
      },
      { property: "og:title", content: "Confession — The Throne Room" },
      {
        property: "og:description",
        content:
          "A confidential place to confess and be met with grace.",
      },
    ],
  }),
  component: ConfessPage,
});

const CATEGORIES = [
  { value: "general", label: "General confession" },
  { value: "addiction", label: "Addiction & habit" },
  { value: "relationships", label: "Relationships" },
  { value: "anger", label: "Anger or bitterness" },
  { value: "lust", label: "Lust or sexual sin" },
  { value: "dishonesty", label: "Dishonesty or theft" },
  { value: "pride", label: "Pride" },
  { value: "doubt", label: "Doubt or wandering faith" },
  { value: "other", label: "Something else" },
];

function ConfessPage() {
  return (
    <PageShell
      background={bg}
      eyebrow="The Confessional"
      title={<>Lay it down.</>}
      subtitle="What is spoken here is held in trust. Only pastoral staff will read it. You may stay completely anonymous."
    >
      <SubmissionForm
        type="confession"
        publicVoiceType="confession"
        categories={CATEGORIES}
        intro="There is no rush, and no template. Say it the way you need to say it."
        contentLabel="Your confession"
        contentPlaceholder="I want to confess that…"
        submitLabel="Bring it before the throne"
      />
    </PageShell>
  );
}
