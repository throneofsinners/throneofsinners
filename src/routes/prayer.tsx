import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/sanctuary/PageShell";
import { SubmissionForm } from "@/components/sanctuary/SubmissionForm";
import bg from "@/assets/bg-prayer.jpg";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "Partner Request — The Throne Room" },
      {
        name: "description",
        content:
          "Request a prayer or accountability partner. Submit anonymously; pastoral leadership reviews and approves each partner request before it is shared publicly.",
      },
      { property: "og:title", content: "Partner Request — The Throne Room" },
      {
        property: "og:description",
        content:
          "Ask for a covenant partner in prayer or accountability. Pastor-reviewed, optionally public.",
      },
    ],
  }),
  component: PartnerRequestPage,
});

const CATEGORIES = [
  { value: "prayer_partner", label: "Prayer partner" },
  { value: "accountability", label: "Accountability partner" },
  { value: "discipleship", label: "Discipleship / mentoring" },
  { value: "recovery", label: "Recovery walk" },
  { value: "marriage", label: "Marriage support" },
  { value: "youth", label: "Youth / young adult" },
  { value: "other", label: "Something else" },
];

function PartnerRequestPage() {
  return (
    <PageShell
      background={bg}
      eyebrow="Partner Requests"
      title={<>Ask for a partner to walk with you.</>}
      subtitle="Request a prayer or accountability partner — anonymously if you wish. Pastoral leadership reviews each request; approved ones may be shared publicly so a willing brother or sister can reach back."
    >
      <SubmissionForm
        type="prayer"
        publicVoiceType="partner_request"
        categories={CATEGORIES}
        intro="Tell us what kind of partner you're hoping for and what season you're in. The more detail you share, the better a pastor can match you. Only what a pastor approves — and what you consent to — is ever shown publicly."
        contentLabel="Describe the partner you're looking for and why"
        contentPlaceholder={
          "Share the essentials so a pastor can match you well:\n\n• What kind of partner? (prayer / accountability / discipleship / recovery / marriage)\n• What season are you in and what are you walking through?\n• How often would you like to connect, and how (text, call, in-person)?\n• Any preferences on gender, age range, or life stage of your partner?\n• Anything else that would help us find the right brother or sister for you."
        }
        submitLabel="Send my partner request"
        showLocation
        locationRequired
        locationLabel="Your location (city, state / country, or region)"
        locationPlaceholder="e.g. Nairobi, Kenya · or Pacific Northwest, USA"
      />

    </PageShell>
  );
}
