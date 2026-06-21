import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/sanctuary/PageShell";
import { SubmissionForm } from "@/components/sanctuary/SubmissionForm";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Prayer Partners — The Throne Room" },
      {
        name: "description",
        content:
          "Anonymous, pastor-supervised one-to-one prayer matching. Built on confidentiality and mutual covenant.",
      },
      { property: "og:title", content: "Prayer Partners — The Throne Room" },
      {
        property: "og:description",
        content:
          "A covenant of quiet, intentional prayer between two souls — held by pastoral oversight.",
      },
    ],
  }),
  component: PartnersPage,
});

const CATEGORIES = [
  { value: "daily", label: "Daily prayer rhythm" },
  { value: "weekly", label: "Weekly check-in" },
  { value: "seasonal", label: "A season of intensity (30–90 days)" },
  { value: "ongoing_struggle", label: "An ongoing struggle" },
  { value: "discernment", label: "Discernment & decision" },
  { value: "other", label: "Something else" },
];

function PartnersPage() {
  return (
    <PageShell
      eyebrow="Prayer Partners"
      title={<>Two souls. One altar.</>}
      subtitle="Anonymous, covenantal, and pastor-supervised. You will not be matched with anyone outside the sanctuary's covenant."
    >
      <ul className="mb-8 grid gap-3 text-sm text-ivory/85">
        <li className="rounded-md border border-gold/20 bg-card/60 p-4">
          <span className="text-gold">·</span>{" "}
          We match you anonymously, by the season you're in and the rhythm you
          can keep.
        </li>
        <li className="rounded-md border border-gold/20 bg-card/60 p-4">
          <span className="text-gold">·</span>{" "}
          Every partnership is reviewed by a pastor at 30 days, 60 days, and at
          your request.
        </li>
        <li className="rounded-md border border-gold/20 bg-card/60 p-4">
          <span className="text-gold">·</span>{" "}
          Either of you may quietly step out at any time. The sanctuary will
          re-match you with grace.
        </li>
      </ul>

      <SubmissionForm
        type="prayer"
        categories={CATEGORIES}
        intro="Share what you'd like your partner to know going in. You'll receive a tracking code while we prayerfully match you."
        contentLabel="What season are you in?"
        contentPlaceholder="I'd like a prayer partner to walk with me through…"
        submitLabel="Request a prayer partner"
      />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already requested one?{" "}
        <Link to="/lookup" className="text-gold hover:underline">
          Open your scroll
        </Link>
      </p>
    </PageShell>
  );
}
