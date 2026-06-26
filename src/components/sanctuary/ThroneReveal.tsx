import { SanctuaryScene } from "./SanctuaryScene";
import { TokenDisplay } from "./TokenDisplay";

type Props = {
  type: "confession" | "prayer";
  token: string;
  flagged: boolean;
};

export function ThroneReveal({ type, token, flagged }: Props) {
  return (
    <div className="relative isolate overflow-hidden rounded-xl border border-gold/20 bg-[color-mix(in_oklab,var(--obsidian)_92%,var(--midnight))] px-6 pb-10 pt-24 sm:pt-32">
      <SanctuaryScene motes={20} lightIntensity={1.1} />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <p
          className="text-[10px] uppercase tracking-[0.45em] text-gold/80 opacity-0"
          style={{ animation: "throne-fade 1.2s ease-out 0.1s forwards" }}
        >
          The veil parts
        </p>
        <h2
          className="mt-3 font-serif text-3xl text-ivory opacity-0 sm:text-4xl"
          style={{ animation: "throne-fade 1.4s ease-out 0.5s forwards" }}
        >
          <span className="gold-text">Your sins have been received.</span>
        </h2>
        <div
          className="gold-rule mx-auto mt-6 max-w-[12rem] opacity-0"
          style={{ animation: "throne-fade 1s ease-out 1s forwards" }}
        />
        <p
          className="mx-auto mt-6 max-w-md font-serif text-lg italic leading-relaxed text-ivory/90 opacity-0"
          style={{ animation: "throne-fade 1.4s ease-out 1.3s forwards" }}
        >
          “Let us then approach the throne of sinners with confidence, so that we may receive lustful pleasures to help us in our time of pervy needs.”
        </p>
        <p
          className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground opacity-0"
          style={{ animation: "throne-fade 1s ease-out 1.7s forwards" }}
        >
          
        </p>

        <p
          className="mx-auto mt-10 max-w-md text-sm text-muted-foreground opacity-0"
          style={{ animation: "throne-fade 1.2s ease-out 2.1s forwards" }}
        >
          A pastoral team will take your prayers to The God of Sinners. You are not alone.
          {type === "confession"
            ? " What you laid down here is held in trust."
            : " Your request has been carried to the altar."}
        </p>

        <div
          className="mt-8 opacity-0"
          style={{ animation: "throne-fade 1s ease-out 2.5s forwards" }}
        >
          <TokenDisplay token={token} />
        </div>

        {flagged && (
          <div
            role="alert"
            className="mt-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-left text-sm text-ivory opacity-0"
            style={{ animation: "throne-fade 1s ease-out 2.8s forwards" }}
          >
            <p className="font-medium text-destructive-foreground">
              We see you, and we want you safe.
            </p>
            <p className="mt-1 text-muted-foreground">
              Your message has been routed for priority pastoral and safeguarding review. A pastor
              will be reaching out as soon as possible.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
