"use client";

import {
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChatBubbleLeftRightIcon,
  CpuChipIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type MouseEvent,
} from "react";

const resources = [
  {
    label: "Features",
    href: "#features",
    description: "Explore the files, links, and messages Vanguard can check.",
    Icon: CpuChipIcon,
  },
  {
    label: "Why Vanguard",
    href: "#why-us",
    description: "See how Vanguard helps you assess suspicious inputs.",
    Icon: ShieldCheckIcon,
  },
  {
    label: "About",
    href: "#about",
    description: "Get to know Vanguard and what the team is building.",
    Icon: UserGroupIcon,
  },
  {
    label: "Testimonials",
    href: "#testimonials",
    description: "Read what people have said about Vanguard.",
    Icon: ChatBubbleLeftRightIcon,
  },
  {
    label: "FAQ",
    href: "#questions",
    description: "Find answers about scans and who Vanguard is for.",
    Icon: QuestionMarkCircleIcon,
  },
];

const contactHref = "#contact";
const barLinkClass = "site-nav-link flex min-h-11 items-center rounded-lg px-3";

function AccountActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled
        className="min-h-11 rounded-lg px-3 text-muted-foreground"
      >
        Log in
      </button>
      <button
        type="button"
        disabled
        className="min-h-11 rounded-lg border border-outline bg-surface-hover px-4 text-muted-foreground"
      >
        Sign up
      </button>
    </div>
  );
}

function NavigationFallback() {
  return (
    <noscript>
      <nav
        aria-label="Main navigation"
        className="site-container pointer-events-auto relative py-2"
      >
        <details className="site-nav-fallback rounded-lg border border-outline bg-black px-4">
          <summary className="site-nav-toggle min-h-11 cursor-pointer content-center rounded-md">
            Menu
          </summary>
          <ul className="grid gap-1 pb-3 text-sm">
            {[
              { href: "#home", label: "Home" },
              ...resources,
              { href: contactHref, label: "Contact Us" },
            ].map(({ href, label }) => (
              <li key={href}>
                <a href={href} className={barLinkClass}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <AccountActions />
            </li>
          </ul>
        </details>
      </nav>
    </noscript>
  );
}

export function SiteNavbar() {
  const [activeHref, setActiveHref] = useState<string>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesMode, setResourcesMode] = useState<"hover" | "open" | null>(
    null,
  );
  const nav = useRef<HTMLElement>(null);
  const resourcesItem = useRef<HTMLLIElement>(null);
  const resourcesToggle = useRef<HTMLButtonElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);

  const closeOnEscape = useEffectEvent((event: KeyboardEvent) => {
    if (
      event.key !== "Escape" ||
      event.defaultPrevented ||
      (!resourcesMode && !mobileOpen)
    )
      return;
    event.preventDefault();

    if (resourcesMode) {
      setResourcesMode(null);
      if (resourcesItem.current?.contains(document.activeElement)) {
        resourcesToggle.current?.focus({ preventScroll: true });
      }
    } else {
      setMobileOpen(false);
      mobileToggle.current?.focus({ preventScroll: true });
    }
  });

  useEffect(() => {
    const breakpoint = getComputedStyle(document.documentElement)
      .getPropertyValue("--breakpoint-navigation")
      .trim();
    const desktop = window.matchMedia(`(min-width: ${breakpoint})`);
    const controller = new AbortController();
    const options = { signal: controller.signal };

    function closeMenus() {
      setResourcesMode(null);
      setMobileOpen(false);
    }

    desktop.addEventListener("change", closeMenus, options);
    document.addEventListener(
      "pointerdown",
      (event) => {
        if (
          event.target instanceof Node &&
          !nav.current?.contains(event.target)
        )
          closeMenus();
      },
      options,
    );
    document.addEventListener(
      "keydown",
      (event) => closeOnEscape(event),
      options,
    );

    return () => controller.abort();
  }, []);

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
        const atBottom =
          scrollY > 0 && scrollY + viewportHeight >= root.scrollHeight - 1;
        const hash = window.location.hash;
        let currentHref: string | undefined;
        let mostVisible = 0;
        for (const section of document.querySelectorAll("main > section[id]")) {
          const link = `#${section.id}`;
          const { top, bottom } = section.getBoundingClientRect();
          const visibleHeight =
            Math.min(bottom, viewportHeight) - Math.max(top, scrollPadding);
          if (visibleHeight <= 0) continue;

          const alignedDestination =
            link === hash && Math.abs(top - scrollPadding) <= 1;
          if (
            alignedDestination ||
            (atBottom && bottom >= viewportHeight - 1)
          ) {
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

  function onLinkSelect(event: MouseEvent<HTMLElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      !(event.target instanceof Element)
    )
      return;

    const href = event.target.closest("a[href]")?.getAttribute("href");
    if (!href) return;
    setResourcesMode(null);
    setMobileOpen(false);
    if (!href.startsWith("#")) return;

    const section = document.getElementById(href.slice(1));
    const headingId = section?.getAttribute("aria-labelledby");
    const heading = headingId ? document.getElementById(headingId) : null;
    if (!heading) return;

    // Native fragment navigation runs before moving focus to the heading.
    requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  }

  return (
    <header className="site-header pointer-events-none sticky top-0 z-40 grid shrink-0 content-center">
      <div className="site-container">
        <nav
          ref={nav}
          aria-label="Main navigation"
          className="site-mega-nav pointer-events-auto relative mx-auto grid h-[3.75rem] max-w-[70rem] grid-cols-[1fr_auto] items-stretch gap-x-2 rounded-2xl border border-outline px-2 text-sm font-medium navigation:grid-cols-[1fr_auto_1fr]"
          onClick={onLinkSelect}
          onPointerLeave={() => {
            if (!resourcesItem.current?.contains(document.activeElement)) {
              setResourcesMode((mode) => (mode === "hover" ? null : mode));
            }
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setResourcesMode(null);
              setMobileOpen(false);
            }
          }}
        >
          <a
            href="#home"
            aria-label="Vanguard AV home"
            className="site-logo ms-2 flex w-fit items-center rounded-lg"
          >
            <Image
              src="/vanguard-wordmark.png"
              alt=""
              width={118}
              height={59}
              loading="eager"
              className="h-[3.125rem] w-auto brightness-125"
            />
          </a>
          <button
            ref={mobileToggle}
            type="button"
            aria-controls="site-navigation-links"
            aria-expanded={mobileOpen}
            className="site-nav-toggle inline-flex min-h-11 cursor-pointer items-center gap-2 self-center rounded-lg px-3 navigation:hidden"
            onClick={() => {
              setMobileOpen(!mobileOpen);
              setResourcesMode(null);
            }}
          >
            {mobileOpen ? (
              <XMarkIcon aria-hidden="true" className="size-5" />
            ) : (
              <Bars3Icon aria-hidden="true" className="size-5" />
            )}
            Menu
          </button>
          <div
            id="site-navigation-links"
            data-open={mobileOpen}
            className="absolute inset-x-0 top-full hidden pt-2 data-[open=true]:block navigation:contents"
          >
            <div className="site-nav-menu max-navigation:max-h-[calc(100dvh-var(--site-header-height))] max-navigation:overflow-y-auto max-navigation:overscroll-contain max-navigation:rounded-2xl max-navigation:border max-navigation:border-outline max-navigation:bg-black max-navigation:p-2 navigation:contents">
              <ul className="grid gap-1 navigation:flex navigation:items-stretch">
                <li className="navigation:flex navigation:items-center">
                  <a
                    href="#home"
                    aria-current={
                      activeHref === "#home" ? "location" : undefined
                    }
                    className={barLinkClass}
                  >
                    Home
                  </a>
                </li>
                <li
                  ref={resourcesItem}
                  className="navigation:flex navigation:items-center"
                  onPointerEnter={(event) => {
                    if (!mobileOpen && event.pointerType === "mouse") {
                      setResourcesMode((mode) => mode ?? "hover");
                    }
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget))
                      setResourcesMode(null);
                  }}
                >
                  <button
                    ref={resourcesToggle}
                    type="button"
                    aria-expanded={resourcesMode !== null}
                    aria-controls="site-navigation-resources"
                    className="site-nav-toggle flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 aria-expanded:bg-surface-hover"
                    onClick={() =>
                      setResourcesMode(resourcesMode === "open" ? null : "open")
                    }
                  >
                    Resources
                    <ChevronDownIcon
                      aria-hidden="true"
                      className={`size-3.5 motion-safe:transition-transform ${resourcesMode ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    id="site-navigation-resources"
                    hidden={resourcesMode === null}
                    className="pt-1 navigation:absolute navigation:inset-x-0 navigation:top-full navigation:pt-2"
                  >
                    <ul className="site-nav-menu grid gap-1 rounded-xl bg-black p-1.5 navigation:max-h-[calc(100dvh-var(--site-header-height))] navigation:grid-cols-3 navigation:overflow-y-auto navigation:overscroll-contain navigation:rounded-2xl navigation:border navigation:border-outline navigation:p-3">
                      {resources.map(({ href, label, description, Icon }) => (
                        <li key={href}>
                          <a
                            href={href}
                            aria-current={
                              href === activeHref ? "location" : undefined
                            }
                            className="site-nav-link flex h-full min-h-11 items-start gap-3 rounded-lg p-2.5 aria-current:bg-surface-selected"
                          >
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-selected text-accent">
                              <Icon aria-hidden="true" className="size-5" />
                            </span>
                            <span>
                              <span className="block font-semibold">
                                {label}
                              </span>
                              <span className="mt-0.5 block text-muted-foreground">
                                {description}
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                <li className="navigation:flex navigation:items-center">
                  <a
                    href={contactHref}
                    aria-current={
                      activeHref === contactHref ? "location" : undefined
                    }
                    className={barLinkClass}
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
              <div className="mt-2 border-t border-outline px-1 pt-2 navigation:mt-0 navigation:justify-self-end navigation:self-center navigation:border-0 navigation:p-0">
                <AccountActions />
              </div>
            </div>
          </div>
        </nav>
      </div>
      <NavigationFallback />
    </header>
  );
}
