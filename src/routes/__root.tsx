import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CrisisBanner } from "../components/sanctuary/CrisisBanner";
import { SiteHeader } from "../components/sanctuary/SiteHeader";
import { SiteFooter } from "../components/sanctuary/SiteFooter";

function NotFoundComponent() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Lost in the corridor</p>
      <h1 className="mt-3 font-serif text-5xl text-ivory">404</h1>
      <p className="mt-2 text-muted-foreground">
        That page is not part of the sanctuary.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-md border border-gold/40 bg-secondary px-4 py-2 text-sm text-ivory hover:bg-gold/10"
      >
        Return to the Throne Room
      </Link>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-3xl text-ivory">
        Something interrupted the prayer.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Please try again. If this keeps happening, the sanctuary stewards have
        been notified.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-md border border-border bg-secondary px-4 py-2 text-sm text-ivory hover:bg-gold/10"
        >
          Go home
        </a>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Throne Room — A sanctuary for confession, prayer & pastoral care" },
      {
        name: "description",
        content:
          "A confidential digital sanctuary for confession, prayer requests, and pastoral care. Submit anonymously and receive a secure tracking code.",
      },
      { name: "author", content: "The Throne Room" },
      { name: "theme-color", content: "#0A0A0A" },
      { property: "og:title", content: "The Throne Room" },
      {
        property: "og:description",
        content:
          "A sacred place to confess, request prayer, and approach the throne of grace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <CrisisBanner />
      <SiteHeader />
      <div id="main">
        <Outlet />
      </div>
      <SiteFooter />
    </QueryClientProvider>
  );
}
