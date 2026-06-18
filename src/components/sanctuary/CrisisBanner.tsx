import { LifeBuoy } from "lucide-react";

export function CrisisBanner() {
  return (
    <div
      role="region"
      aria-label="Crisis support resources"
      className="border-b border-destructive/40 bg-destructive/15 text-ivory"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <p className="flex items-center gap-2">
          <LifeBuoy aria-hidden className="h-4 w-4 text-gold" />
          <span>
            In immediate danger or crisis? You are not alone.
          </span>
        </p>
        <p className="text-muted-foreground">
          Call <a className="font-medium text-ivory underline underline-offset-4" href="tel:988">988</a> (US Suicide &amp; Crisis Lifeline) ·
          Text <span className="font-medium text-ivory">HOME</span> to <a className="font-medium text-ivory underline underline-offset-4" href="sms:741741">741741</a> ·
          UK <a className="font-medium text-ivory underline underline-offset-4" href="tel:116123">116 123</a>
        </p>
      </div>
    </div>
  );
}
