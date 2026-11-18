import {
  IconCode,
  IconHeadset,
  IconRadar,
  IconScanEye,
  IconShieldBolt,
  IconShieldCheck,
} from "@tabler/icons-react";

const benefits = [
  {
    icon: IconShieldCheck,
    title: "All-in-One Cyber Shield",
    description:
      "One intelligent solution that replaces disconnected security tools by scanning file, emails, URLs, code, and hidden threats in media, all from a single place.",
  },
  {
    icon: IconScanEye,
    title: "Invisible Threat Hunter",
    description:
      "Powered by AI, Vanguard detects zero-day malware, phishing emails, and hidden data inside images, covering attack vectors traditional antivirus often overlooks.",
  },
  {
    icon: IconShieldBolt,
    title: "Effortless Security",
    description:
      "Whether you're a developer, freelancer, or small business, Vanguard delivers powerful protection without complicated setups or expensive security stacks.",
  },
  {
    icon: IconRadar,
    title: "Instant Threat Vision",
    description:
      "Instant risk scores, prioritized alerts, and detailed reports give you a clear understanding of every threat so you can respond quickly and confidently.",
  },
  {
    icon: IconCode,
    title: "Fortified Code",
    description:
      "Vanguard analyzes your source code, libraries, and files to uncover hidden vulnerabilities before attackers have the chance to exploit them.",
  },
  {
    icon: IconHeadset,
    title: "24/7 Dedicated",
    description:
      "Our security experts are always on standby to walk you through every alert, answer every question, and resolve every concern, so you never face a threat alone.",
  },
];

export function WhyUs() {
  return (
    <section
      id="why-us"
      aria-labelledby="why-us-title"
      className="bg-canvas px-[clamp(1.25rem,4.45vw,5rem)] py-[clamp(4.5rem,9vw,8rem)] text-foreground selection:bg-accent selection:text-canvas"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-[clamp(2rem,5vw,4rem)] grid items-end gap-5 md:grid-cols-[3fr_2fr] md:gap-10">
          <h2
            id="why-us-title"
            className="text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.98] font-medium tracking-[-0.02em]"
          >
            Why choose Vanguard?
          </h2>
          <p className="max-w-[35ch] text-base leading-relaxed text-muted-foreground md:justify-self-end lg:text-lg">
            Vanguard brings checks for files, links, messages, and code
            together so you can see what needs your attention.
          </p>
        </div>

        {/* The hover treatment is adapted from Aceternity UI’s Feature Sections. */}
        <ul className="grid gap-px border-y border-outline bg-outline sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="group/benefit relative isolate bg-canvas py-5 pr-4 pl-5 md:px-[clamp(1.25rem,3vw,2.75rem)] md:py-6 lg:py-7"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-surface-hover to-transparent opacity-0 group-hover/benefit:opacity-100 motion-safe:transition-opacity motion-safe:duration-200"
              />
              <Icon
                aria-hidden="true"
                size={28}
                stroke={1.5}
                className="mb-3 text-accent md:mb-4"
              />
              <h3 className="relative mb-2 max-w-[20ch] text-xl leading-tight font-medium tracking-[-0.02em] text-pretty lg:text-2xl">
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-[-1.25rem] h-full w-px bg-accent/40 group-hover/benefit:bg-accent motion-safe:transition-colors md:left-[calc(-1*clamp(1.25rem,3vw,2.75rem))]"
                />
                {title}
              </h3>
              <p className="max-w-[32ch] text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
