import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/sanctuary/PageShell";
import { SubmissionForm } from "@/components/sanctuary/SubmissionForm";
import bg from "@/assets/bg-testimony.jpg";

export const Route = createFileRoute("/testimony")({
  head: () => ({
    meta: [
      { title: "The Testimony — The Throne Room" },
      {
        name: "description",
        content:
          "Share the story of your restoration. Every testimony is reviewed by pastoral leadership before being offered as light to others.",
      },
      { property: "og:title", content: "The Testimony — The Throne Room" },
      {
        property: "og:description",
        content: "Tell of what grace has done. Your story may carry someone else home.",
      },
    ],
  }),
  component: TestimonyPage,
});

const CATEGORIES = [
  { value: "salvation", label: "Salvation" },
  { value: "healing", label: "Healing" },
  { value: "deliverance", label: "Deliverance" },
  { value: "marriage", label: "Marriage restored" },
  { value: "addiction", label: "Freedom from addiction" },
  { value: "provision", label: "Provision" },
  { value: "answered_prayer", label: "Answered prayer" },
  { value: "other", label: "Something else" },
];

function TestimonyPage() {
  return (
    <PageShell
      background={bg}
      eyebrow="The Testimony"
      title={<>Tell of what grace has done.</>}
      subtitle="Pastoral leadership prayerfully reviews each testimony before it is offered as encouragement to the sanctuary."
    >
      <SubmissionForm
        type="prayer"
        publicVoiceType="testimony"
        categories={CATEGORIES}
        intro="Write as much or as little as you'd like. We will not publish your name or contact details without your explicit permission."
        contentLabel="Your testimony"
        contentPlaceholder="What the Lord has done for me…"
        submitLabel="Offer this testimony"
      />
    </PageShell>
  );
}
