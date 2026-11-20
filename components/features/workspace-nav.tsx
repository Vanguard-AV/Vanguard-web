"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FEATURE_CATALOG } from "@/lib/features/catalog";

const NAV_ITEMS = [
  { href: "/features", label: "All Scanners" },
  ...FEATURE_CATALOG.map((feature) => ({
    href: feature.route,
    label: feature.shortLabel,
  })),
] as const;

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Security scanners"
      className="workspace-scroll flex items-center gap-1 overflow-x-auto border-b border-outline pb-2"
    >
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 ${
              isActive
                ? "workspace-nav-active bg-surface-selected text-accent"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
