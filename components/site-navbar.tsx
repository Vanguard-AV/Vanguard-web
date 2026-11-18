"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  NavBody,
  NavItems,
  Navbar,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

const links = [
  { name: "Home", link: "#home" },
  { name: "About", link: "#about" },
  { name: "Why Us", link: "#why-us" },
  { name: "Features", link: "#features" },
  { name: "Channels", link: "#channels" },
  { name: "Testimonials", link: "#testimonials" },
  { name: "Contact", link: "#contact" },
];

const scrolledSurface =
  "bg-transparent dark:bg-transparent data-scrolled:bg-surface/80 data-scrolled:ring-1 data-scrolled:ring-outline";

const activeLinkClassName =
  "aria-[current=location]:bg-surface-selected aria-[current=location]:text-accent! after:absolute after:inset-y-0 after:end-3.5 after:my-auto after:hidden after:h-0.5 after:w-3.5 after:rounded-full after:bg-current aria-[current=location]:after:block lg:after:inset-x-0 lg:after:top-auto lg:after:bottom-1 lg:after:mx-auto lg:after:my-0";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getActiveHref() {
  const hash = window.location.hash;
  if (hash === "#about-values") return "#about";
  return links.find(({ link }) => link === hash)?.link ?? "#home";
}

function getInitialHref() {
  return "#home";
}

function AuthActions({ className }: { className: string }) {
  return (
    <div role="group" aria-label="Account" className={className}>
      <NavbarButton
        as="button"
        type="button"
        variant="secondary"
        disabled
        className="min-h-11 whitespace-nowrap text-foreground disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-55 dark:text-foreground"
      >
        Log in
      </NavbarButton>
      <NavbarButton
        as="button"
        type="button"
        disabled
        className="min-h-11 whitespace-nowrap disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-55"
      >
        Sign up
      </NavbarButton>
    </div>
  );
}

function SiteLogo({ onClick }: { onClick?: () => void }) {
  return (
    <a href="#home" onClick={onClick} className="relative z-20 shrink-0 rounded-md px-1">
      <Image
        src="/vanguard-wordmark.png"
        alt="Vanguard AV home"
        width={118}
        height={59}
        loading="eager"
        className="h-auto w-26 brightness-125 lg:w-[7.375rem]"
      />
    </a>
  );
}

export function SiteNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const activeHref = useSyncExternalStore(subscribeToHash, getActiveHref, getInitialHref);
  const menuId = useId();
  const navigation = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const MenuIcon = isOpen ? IconX : IconMenu2;

  useEffect(() => {
    if (!isOpen) return;

    function dismissOnOutsidePress(event: PointerEvent) {
      if (event.target instanceof Node && !navigation.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", dismissOnOutsidePress);
    return () => document.removeEventListener("pointerdown", dismissOnOutsidePress);
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
    toggle.current?.focus();
  }

  return (
    <header className="sticky top-0 z-40 h-0 px-4 sm:px-6 lg:px-8">
      <nav
        ref={navigation}
        aria-label="Main navigation"
        className="pt-3 lg:pt-4"
        onBlur={(event) => {
          if (isOpen && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
            setIsOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isOpen) {
            event.stopPropagation();
            closeMenu();
          }
        }}
      >
        <Navbar className="relative top-0">
          <NavBody className={`min-w-[min(100%,64rem)]! gap-4 rounded-md px-6 ${scrolledSurface}`}>
            <SiteLogo />
            <NavItems
              items={links}
              activeHref={activeHref}
              className="static flex-none gap-0.5 space-x-0 lg:space-x-0"
              itemClassName={`${activeLinkClassName} flex min-h-11 items-center rounded-md px-2.5 whitespace-nowrap text-foreground/80 hover:text-foreground xl:px-3 dark:text-foreground/80`}
              highlightClassName="rounded-md bg-surface-hover dark:bg-surface-hover"
            />
            <AuthActions className="flex shrink-0 items-center gap-1" />
          </NavBody>

          <MobileNav className={`max-w-none rounded-md! ${scrolledSurface}`}>
            <MobileNavHeader>
              <SiteLogo onClick={isOpen ? closeMenu : undefined} />
              <button
                ref={toggle}
                type="button"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-controls={menuId}
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
                className="grid size-11 cursor-pointer place-items-center rounded-md text-foreground"
              >
                <MenuIcon aria-hidden="true" />
              </button>
            </MobileNavHeader>
            <div id={menuId} inert={!isOpen} data-lenis-prevent className="contents">
              <MobileNavMenu
                isOpen={isOpen}
                onClose={closeMenu}
                className="top-full mt-2 max-h-[calc(100dvh-8rem)] gap-3 overflow-y-auto overscroll-contain rounded-md bg-surface-raised py-4 ring-1 ring-outline dark:bg-surface-raised"
              >
                <ul className="grid w-full gap-0.5">
                  {links.map(({ name, link }) => (
                    <li key={link}>
                      <a
                        href={link}
                        aria-current={link === activeHref ? "location" : undefined}
                        onClick={closeMenu}
                        className={`${activeLinkClassName} relative flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-hover hover:text-foreground motion-reduce:transition-none`}
                      >
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
                <AuthActions className="grid w-full grid-cols-2 gap-3" />
              </MobileNavMenu>
            </div>
          </MobileNav>
        </Navbar>
      </nav>
    </header>
  );
}
