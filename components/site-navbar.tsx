"use client";

import Image from "next/image";
import { useEffect, useState, type MouseEvent } from "react";
import CardNav from "@/components/ui/CardNav";

const navigationItems = [
  {
    label: "Vanguard AV",
    links: [{ label: "About", href: "#about" }],
  },
  {
    label: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    label: "Help",
    links: [{ label: "FAQ", href: "#questions" }],
  },
];

const logIn = { label: "Log in", disabled: true };
const signUp = { label: "Sign up", disabled: true };

function Wordmark() {
  return (
    <Image
      src="/vanguard-wordmark.png"
      alt=""
      width={118}
      height={59}
      loading="eager"
      className="brightness-125"
    />
  );
}

function NavigationFallback() {
  return (
    <noscript>
      <nav aria-label="Main navigation" className="site-container pointer-events-auto relative py-2">
        <button type="button" disabled={logIn.disabled} className="absolute end-4 top-2 min-h-11 px-2 text-sm text-muted-foreground">
          {logIn.label}
        </button>
        <details className="site-nav-fallback rounded-lg border border-outline bg-surface px-4">
          <summary className="site-nav-toggle min-h-11 cursor-pointer content-center rounded-md">
            Menu
          </summary>
          <ul className="grid gap-1 pb-3 text-sm">
            <li>
              <a href="#home" className="site-nav-link flex min-h-11 items-center px-2">
                Home
              </a>
            </li>
            {navigationItems.flatMap(({ links }) => links).map(({ href, label }) => (
              <li key={href}>
                <a href={href} className="site-nav-link flex min-h-11 items-center px-2">
                  {label}
                </a>
              </li>
            ))}
            <li>
              <button type="button" disabled className="min-h-11 px-2 text-muted-foreground">
                {signUp.label}
              </button>
            </li>
          </ul>
        </details>
      </nav>
    </noscript>
  );
}

export function SiteNavbar() {
  const [activeHref, setActiveHref] = useState<string>();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    let frame: number | undefined;
    let scrollPadding = readScrollPadding();

    function readScrollPadding() {
      return parseFloat(getComputedStyle(root).scrollPaddingBlockStart) || 0;
    }

    function updateCurrentSection() {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        const scrollY = window.scrollY;
        const viewportHeight = root.clientHeight;
        setScrolled(scrollY > 0);

        const atBottom = scrollY > 0 && scrollY + viewportHeight >= root.scrollHeight - 1;
        const hash = window.location.hash;
        let currentHref: string | undefined;
        let mostVisible = 0;
        for (const section of document.querySelectorAll("main > section[id]")) {
          const link = `#${section.id}`;
          const { top, bottom } = section.getBoundingClientRect();
          const visibleHeight = Math.min(bottom, viewportHeight) - Math.max(top, scrollPadding);
          if (visibleHeight <= 0) continue;

          const alignedDestination = link === hash && Math.abs(top - scrollPadding) <= 1;
          if (alignedDestination || (atBottom && bottom >= viewportHeight - 1)) {
            currentHref = link;
            break;
          }

          if (visibleHeight > mostVisible) {
            mostVisible = visibleHeight;
            currentHref = link;
          }
        }
        setActiveHref(currentHref);
      });
    }

    function updateViewport() {
      scrollPadding = readScrollPadding();
      updateCurrentSection();
    }

    const resizeObserver = new ResizeObserver(updateCurrentSection);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", updateCurrentSection, { passive: true });
    window.addEventListener("hashchange", updateCurrentSection);
    window.addEventListener("resize", updateViewport);
    window.addEventListener("pageshow", updateViewport);
    updateCurrentSection();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateCurrentSection);
      window.removeEventListener("hashchange", updateCurrentSection);
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("pageshow", updateViewport);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  function onSectionSelect(event: MouseEvent<HTMLElement>) {
    if (
      event.defaultPrevented || event.button !== 0 ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      !(event.target instanceof Element)
    ) return;

    const href = event.target.closest('a[href^="#"]')?.getAttribute("href");
    if (!href) return;

    const section = document.getElementById(href.slice(1));
    const headingId = section?.getAttribute("aria-labelledby");
    const heading = headingId ? document.getElementById(headingId) : null;
    if (!heading) return;

    // Native fragment navigation runs before moving focus to the heading.
    requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  }

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="site-header pointer-events-none sticky top-0 z-40 grid shrink-0 content-center"
      onClick={onSectionSelect}
    >
      <div className="site-container">
        <CardNav
          ariaLabel="Main navigation"
          className="site-card-nav"
          logo={<Wordmark />}
          logoHref="#home"
          logoAlt="Vanguard AV home"
          items={navigationItems.map((item) => ({
            ...item,
            links: item.links.map((link) => ({
              ...link,
              current: link.href === activeHref,
            })),
          }))}
          barAction={logIn}
          cta={signUp}
          openOn="hover"
          cardEffect="unfold"
          bounce={0.21}
          cardHeight={164}
          maxWidth={1120}
          style={{
            "--cn-panel": "var(--site-card-nav-surface, rgb(17 20 17 / 82%))",
            "--cn-tile": "var(--color-surface-raised)",
            "--cn-text": "var(--color-foreground)",
            "--cn-muted": "var(--color-muted-foreground)",
            "--cn-hover": "var(--color-surface-hover)",
            "--cn-ring": "var(--color-accent)",
            "--cn-current": "var(--color-accent)",
            "--cn-viewport-inset": "var(--site-header-height)",
            "--cn-logo": "50px",
          }}
        />
      </div>
      <NavigationFallback />
    </header>
  );
}
