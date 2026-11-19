import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { siteContact } from "@/lib/site-contact";
import { siteSocialLinks } from "@/lib/site-social-links";

const linkGroups = [
  {
    title: "Product",
    links: [
      { title: "Features", href: "/#features" },
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
      { title: "Contact us", href: "/#contact" },
    ],
  },
];

const socialLinks = [siteSocialLinks.x, siteSocialLinks.linkedIn];
const footerLinkClass = "inline-flex min-h-8 max-w-full items-center rounded-sm wrap-anywhere transition-colors hover:text-footer-foreground hover:underline focus-visible:underline";

export default function Footer({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const emailId = useId();

  return (
    <footer data-theme={theme} className="footer-4 bg-footer-background pt-7 text-footer-foreground sm:pt-10">
      <div className="site-container">
        <div className="grid items-start gap-x-6 gap-y-6 sm:grid-cols-[minmax(11rem,1fr)_minmax(0,2fr)] lg:grid-cols-[minmax(11rem,1fr)_minmax(0,2fr)_minmax(15rem,1.25fr)] lg:gap-x-8 xl:gap-x-14">
          <div className="grid grid-cols-[7.375rem_minmax(0,1fr)] items-start gap-x-4 sm:row-span-2 sm:grid-cols-1 sm:gap-y-2 lg:row-span-1">
            <Link href="/#home" className="block w-fit rounded-sm">
              <Image
                src="/vanguard-wordmark.png"
                alt="Vanguard AV home"
                width={118}
                height={59}
                className="h-auto w-[7.375rem] rounded-sm brightness-125"
              />
            </Link>
            <address className="grid justify-items-start text-sm text-footer-muted-foreground not-italic">
              <a href={`mailto:${siteContact.email}`} className={footerLinkClass}>{siteContact.email}</a>
              <a href={`tel:${siteContact.phone}`} className={footerLinkClass}>{siteContact.phone}</a>
              <p className="py-1.5">{siteContact.location}</p>
            </address>
          </div>

          <nav aria-label="Footer navigation" className="grid min-w-0 grid-cols-3 gap-x-3 sm:gap-x-5">
            {linkGroups.map(({ title, links }) => (
              <div key={title} className="space-y-1 text-sm">
                <h2 className="font-medium">{title}</h2>
                <ul className="text-footer-muted-foreground">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={footerLinkClass}
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <fieldset disabled className="min-w-0 space-y-2 sm:max-w-xs lg:ms-auto lg:w-full">
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
                className="h-10 rounded-md border border-footer-input bg-footer-muted px-3 text-sm font-medium text-footer-muted-foreground disabled:cursor-not-allowed"
              >
                Subscribe
              </button>
            </div>
            <p className="text-sm text-footer-muted-foreground">Signup is currently unavailable.</p>
          </fieldset>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-footer-border py-2 text-sm text-footer-muted-foreground sm:mt-8">
          <p>© 2026 Vanguard AV. All rights reserved.</p>
          <div className="flex">
            {socialLinks.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="grid size-11 place-items-center rounded-md transition-colors hover:text-footer-foreground"
              >
                <Icon aria-hidden="true" className="size-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
