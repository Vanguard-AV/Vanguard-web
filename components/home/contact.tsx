import { IconArrowUpRight } from "@tabler/icons-react";
import { Instrument_Serif } from "next/font/google";
import { siteSocialLinks } from "@/lib/site-social-links";
import { HomeContactForm } from "./contact-form";

const contactChannels = [siteSocialLinks.linkedIn, siteSocialLinks.x];
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

export function Contact() {
  return (
    <HomeContactForm
      title={<>Talk to <em className={`${instrumentSerif.className} font-normal text-accent`}>Vanguard.</em></>}
      details={(
        <ul className="max-w-xs divide-y divide-outline text-sm">
          {contactChannels.map(({ name, href, Icon }) => (
            <li key={name}>
              <a
                href={href}
                className="group flex min-h-11 items-center gap-2.5 rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0 text-accent" stroke={1.5} />
                {name}
                <IconArrowUpRight aria-hidden="true" className="ms-auto size-3.5 shrink-0 text-muted-foreground group-hover:text-accent" stroke={1.5} />
              </a>
            </li>
          ))}
        </ul>
      )}
    />
  );
}
