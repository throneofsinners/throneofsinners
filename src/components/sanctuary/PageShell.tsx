import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, subtitle, children }: Props) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20">
      <header className="text-center">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.3em] text-gold/80">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 font-serif text-4xl text-ivory sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {subtitle}
          </p>
        )}
        <div className="gold-rule mx-auto mt-8 max-w-xs" />
      </header>
      <section className="mt-10">{children}</section>
    </main>
  );
}
