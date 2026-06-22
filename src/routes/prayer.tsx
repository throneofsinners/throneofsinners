import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/sanctuary/PageShell";
import { SubmissionForm } from "@/components/sanctuary/SubmissionForm";
import bg from "@/assets/bg-prayer.jpg";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "Prayer Request — The Throne Room" },
      {
        name: "description",
        content:
          "Submit a prayer request. A trusted prayer team will carry it before the throne with you.",
      },
      { property: "og:title", content: "Prayer Request — The Throne Room" },
      {
        property: "og:description",
        content:
          "A pastoral team will pray with you. Submit anonymously or share your name.",
      },
    ],
  }),
  component: PrayerPage,
});

const CATEGORIES = [
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
  { value: "health", label: "Health" },
  { value: "financial", label: "Financial" },
  { value: "spiritual_growth", label: "Spiritual growth" },
  { value: "relationship", label: "Relationship" },
  { value: "emergency", label: "Emergency" },
];

function PrayerPage() {
  return (
    <PageShell
      background={bg}
      eyebrow="The Prayer Altar"
      title={<>Let us pray with you.</>}
      subtitle="Tell us what to pray for. A pastoral prayer team will carry your request to the throne and respond to you in time."
    >
      <SubmissionForm
        type="prayer"
        categories={CATEGORIES}
        intro="Share as much or as little as you need. Even a sentence is enough."
        contentLabel="What would you like prayer for?"
        contentPlaceholder="Please pray for…"
        submitLabel="Send it to the prayer altar"
      />
    </PageShell>
  );
}
