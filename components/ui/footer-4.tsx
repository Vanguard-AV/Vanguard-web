import { IconBrandLinkedin, IconBrandX } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useId } from "react";

const linkGroups = [
  {
    title: "Product",
    links: [
      { title: "Features", href: "/#features" },
      { title: "How it works", href: "/#how-it-works" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "FAQ", href: "/#questions" },
      { title: "Testimonials", href: "/#testimonials" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "/#about" },
      { title: "Why Vanguard", href: "/#why-us" },
    ],
  },
];

const socialLinks = [
  { title: "X / Twitter", href: "https://x.com/vanguard_AV", Icon: IconBrandX },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/company/vanguard-av/",
    Icon: IconBrandLinkedin,
  },
];

export default function Footer({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const emailId = useId();

  return (
    <footer data-theme={theme} className="footer-4 bg-footer-background pt-8 text-footer-foreground sm:pt-20">
      <div className="site-container space-y-10 sm:space-y-16">
        <div className="max-w-xs space-y-3">
          <Link href="/#home" className="block w-fit rounded-sm">
            <Image
              src="/vanguard-wordmark.png"
              alt="Vanguard AV home"
              width={118}
              height={59}
              className="h-auto w-[7.375rem] rounded-sm brightness-125"
            />
          </Link>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map(({ title, href, Icon }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={title}
                className="grid size-11 place-items-center rounded-md text-footer-muted-foreground transition-colors hover:text-footer-foreground"
              >
                <Icon aria-hidden="true" className="size-5" />
              </a>
            ))}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="h-px bg-[linear-gradient(90deg,var(--footer-foreground)_1px,transparent_1px)] bg-size-[6px_1px] bg-repeat-x opacity-25"
        />

        <div className="grid gap-10 md:grid-cols-5">
          <nav aria-label="Footer navigation" className="grid gap-6 sm:grid-cols-3 md:col-span-3">
            {linkGroups.map(({ title, links }) => (
              <div key={title} className="space-y-2 text-sm">
                <h2 className="font-medium">{title}</h2>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 sm:flex-col">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-8 items-center rounded-sm text-footer-muted-foreground transition-colors hover:text-footer-foreground hover:underline"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <fieldset disabled className="min-w-0 space-y-3 md:col-span-2 md:ml-auto md:w-full md:max-w-xs">
            <label htmlFor={emailId} className="block text-sm font-medium">
              Subscribe to our newsletter
            </label>
            <div className="flex gap-2">
              <input
                id={emailId}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Your email"
                className="h-10 min-w-0 flex-1 rounded-md border border-footer-input bg-footer-muted px-3 text-base placeholder:text-footer-muted-foreground md:text-sm"
              />
              <button
                type="button"
                className="h-10 rounded-md bg-footer-primary px-3 text-sm font-medium text-footer-primary-foreground disabled:cursor-not-allowed"
              >
                Subscribe
              </button>
            </div>
            <p className="text-sm text-footer-muted-foreground">Signup is currently unavailable.</p>
          </fieldset>
        </div>

        <div className="border-t border-footer-border py-8 text-sm text-footer-muted-foreground">
          <p>© 2026 Vanguard AV. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
