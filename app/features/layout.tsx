import Link from "next/link";
import { WorkspaceNav } from "@/components/features/workspace-nav";
import { SiteNavbar } from "@/components/site-navbar";

export default function FeaturesLayout({
  children,
}: LayoutProps<"/features">) {
  return (
    <div className="relative isolate flex min-h-svh flex-col bg-canvas text-foreground">
      <a
        href="#features-main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-lg focus:border focus:border-accent focus:bg-surface-raised focus:px-4 focus:text-sm focus:font-semibold focus:text-accent"
      >
        Skip to scanner workspace
      </a>

      <SiteNavbar />

      <div className="site-container flex flex-1 flex-col pt-[calc(var(--site-header-height)+1rem)] pb-12">
        <div className="mx-auto flex w-full max-w-[64rem] flex-1 flex-col gap-6">
          <WorkspaceNav />

          <main
            id="features-main"
            tabIndex={-1}
            className="flex flex-1 flex-col outline-none"
          >
            {children}
          </main>
        </div>
      </div>

      <footer className="border-t border-outline">
        <div className="site-container">
          <div className="mx-auto flex w-full max-w-[64rem] flex-wrap items-center justify-between gap-3 py-4 text-xs text-muted-foreground">
            <p>
              Static advisory inspection — files are never executed and inputs are never stored.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline"
              >
                Home
              </Link>
              <Link
                href="/#contact"
                className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
