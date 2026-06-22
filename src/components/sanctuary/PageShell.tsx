import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  background?: string;
  wide?: boolean;
};

export function PageShell({ eyebrow, title, subtitle, children, background, wide }: Props) {
  return (
    <div className="relative isolate min-h-dvh">
      {background && (
        <>
          <img
            src={background}
            alt=""
            aria-hidden
            loading="lazy"
            width={1536}
            height={896}
            className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 90% 65% at 50% 28%, transparent 0%, oklch(0.13 0.012 260 / 0.72) 55%, oklch(0.08 0.008 260 / 0.97) 100%)",
            }}
          />
        </>
      )}
      <main className={`mx-auto w-full ${wide ? "max-w-6xl" : "max-w-2xl"} px-4 pt-28 pb-12 sm:pt-32 sm:pb-20`}>
        <header className="text-center">
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80">{eyebrow}</p>
          )}
          <h1 className="mt-3 font-serif text-4xl text-ivory sm:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{subtitle}</p>
          )}
          <div className="gold-rule mx-auto mt-8 max-w-xs" />
        </header>
        <section className="mt-10">{children}</section>
      </main>
    </div>
  );
}
