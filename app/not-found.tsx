import { ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { FEATURE_CATALOG } from "@/lib/features/catalog";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-svh flex-col bg-canvas text-foreground">
      <SiteNavbar />

      <main className="site-container flex flex-1 flex-col justify-center pt-[calc(var(--site-header-height)+2rem)] pb-14">
        <div className="mx-auto w-full max-w-[45rem]">
          <div className="workspace-panel space-y-6 rounded-xl border border-outline bg-surface p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <ShieldAlert
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-caution"
                strokeWidth={1.75}
              />
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
                  Page or scanning feature not found
                </h1>
                <p className="max-w-[60ch] text-sm leading-6 text-muted-foreground">
                  The route you requested does not match an active Vanguard AV page or scanning
                  capability. Choose one of the five live scanners below or return to the
                  homepage.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/features"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary motion-safe:transition-colors motion-safe:duration-150 hover:bg-primary-hover active:bg-primary-pressed"
              >
                <span>Choose a scanning feature</span>
                <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-xl border border-border-control bg-surface-raised px-4 text-sm font-semibold text-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover"
              >
                Return to homepage
              </Link>
            </div>

            <div className="border-t border-outline pt-5">
              <h2 className="text-sm font-semibold text-foreground">
                Available live scanners
              </h2>
              <ul className="mt-3 divide-y divide-outline rounded-lg border border-outline bg-canvas">
                {FEATURE_CATALOG.map((feature) => (
                  <li key={feature.slug}>
                    <Link
                      href={feature.route}
                      className="flex min-h-11 items-center justify-between px-3.5 text-sm font-medium text-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover"
                    >
                      <span>{feature.name}</span>
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 text-accent"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
