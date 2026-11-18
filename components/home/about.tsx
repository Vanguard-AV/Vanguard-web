import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AboutStack } from "./about-stack";

const stackPanelClassName =
  "relative mb-[clamp(2rem,5vw,4rem)] origin-bottom scroll-mt-28 rounded-xl bg-canvas p-[clamp(1.5rem,3vw,3rem)] last:mb-0 motion-safe:sticky motion-safe:top-[var(--stack-top,7rem)] motion-safe:[&:not(:first-child)]:shadow-[0_-1rem_3rem_rgb(0_0_0/35%)]";

const stackAnimationClassName =
  "motion-safe:supports-[animation-timeline:view()]:animate-stack-depth motion-safe:supports-[animation-timeline:view()]:[animation-range:entry_0%_entry_100%]";

// Separate range longhands preserve the exit endpoint through production CSS minification.
const photoClassName =
  "size-full object-cover motion-safe:supports-[animation-timeline:view()]:animate-photo-drift motion-safe:supports-[animation-timeline:view()]:[animation-range-start:entry_0%] motion-safe:supports-[animation-timeline:view()]:[animation-range-end:exit_100%]";

const displayTitleClassName =
  "text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.98] font-medium tracking-[-0.02em]";

const values = [
  {
    title: "Clarity comes first",
    description:
      "A finding should explain what was checked, what it means, and what you can do next. We believe security works better when the explanation makes sense to the person reading it.",
  },
  {
    title: "Look before you leap",
    description:
      "Vanguard’s approach starts with static analysis: examining a file without executing it. The URL model assesses the supplied text without visiting the destination. Understanding comes before action.",
  },
  {
    title: "Different inputs. One perspective.",
    description:
      "We’re bringing files, links, messages, and code into a shared view. Each type of input needs its own analysis, while the person reviewing the findings needs a clear, connected picture.",
  },
  {
    title: "Honest about the unknown",
    description:
      "A result should communicate its limits as clearly as its findings. Incomplete coverage and inconclusive results deserve an explanation, so you can make an informed decision about the next step.",
  },
];

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="bg-canvas px-[clamp(1.25rem,4.45vw,5rem)] text-foreground selection:bg-accent selection:text-canvas"
    >
      <AboutStack className="isolate mx-auto max-w-7xl [timeline-scope:--stack-manifesto,--stack-values]">
        <div
          data-stack-panel
          className={`${stackPanelClassName} ${stackAnimationClassName} z-1 grid min-h-[calc(100svh-9rem)] content-center items-center gap-8 md:grid-cols-2 md:gap-x-[clamp(3rem,4.45vw,4rem)] motion-safe:supports-[animation-timeline:view()]:[animation-timeline:--stack-manifesto] motion-safe:supports-[animation-timeline:view()]:[view-timeline-name:--about-intro]`}
        >
          <div className="@container min-w-0">
            <h2
              id="about-title"
              aria-label="About Vanguard"
              className="text-[min(19cqi,5.5rem)] leading-none font-medium tracking-[-0.035em]"
            >
              Vanguard
            </h2>
            <p className="mt-4 max-w-[29ch] text-[clamp(1.25rem,2.35vw,1.875rem)] leading-[1.4] text-pretty text-muted-foreground md:mt-6">
              We’re built on one simple belief. Digital security should help you
              understand what to trust and what to do next.
            </p>
          </div>

          <div className="aspect-[7/5] overflow-hidden bg-surface-raised">
            {/* Unsplash placeholder photography, not the Vanguard team. See public/images/README.md. */}
            <Image
              src="/images/about-placeholder.jpg"
              alt="People working together on laptops around a wooden table"
              width={1600}
              height={1096}
              className={`${photoClassName} motion-safe:supports-[animation-timeline:view()]:[animation-timeline:--about-intro]`}
              sizes="(min-width: 1440px) 608px, (min-width: 768px) 44vw, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)"
            />
          </div>
        </div>

        <section
          data-stack-panel
          className={`${stackPanelClassName} ${stackAnimationClassName} z-2 flex h-[calc(100svh-8.5rem)] min-h-min flex-col gap-[clamp(1rem,4svh,3rem)] py-[clamp(1rem,3svh,2.5rem)] max-md:px-3 motion-safe:supports-[animation-timeline:view()]:[animation-timeline:--stack-values] motion-safe:supports-[animation-timeline:view()]:[view-timeline-name:--stack-manifesto]`}
          aria-labelledby="about-manifesto-title"
        >
          <div className="grid shrink-0 items-end gap-3 md:grid-cols-2 md:gap-x-[clamp(3rem,4.45vw,4rem)]">
            <h3 id="about-manifesto-title" className={displayTitleClassName}>
              Know more.
              <br />
              Trust wisely.
            </h3>
            <p className="max-w-[37ch] text-base leading-[1.55] text-muted-foreground md:ms-auto md:indent-12">
              Threats arrive in everyday places - a shared file, an unfamiliar
              link, a message that feels almost right. We&qout;re building
              Vanguard to bring these inputs into one clear view, helping you
              understand the risk before you decide what comes next.
            </p>
          </div>

          <div className="flex flex-1 flex-col rounded-xl bg-primary p-[clamp(1rem,min(2.65vw,4svh),2.5rem)] text-on-primary motion-safe:supports-[animation-timeline:view()]:[view-timeline-name:--about-signal]">
            <div className="relative min-h-24 flex-1 overflow-hidden rounded-lg bg-surface-raised">
              <Image
                src="/images/about-workspace.jpg"
                alt="A group sharing ideas and working on laptops in a sunlit workspace"
                fill
                className={`${photoClassName} motion-safe:supports-[animation-timeline:view()]:[animation-timeline:--about-signal]`}
                sizes="(min-width: 1440px) 1216px, (min-width: 768px) 86vw, 90vw"
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-8 gap-y-3 pt-[clamp(0.75rem,2svh,1.5rem)]">
              <p className="text-[clamp(1.375rem,5vw,1.875rem)] leading-[1.05] font-medium tracking-[-0.02em] md:text-[clamp(1.875rem,3.3vw,3rem)]">
                A clearer picture.
                <br />A more confident next step.
              </p>
              <a
                href="#about-values"
                className="group inline-flex min-h-11 items-center justify-between gap-12 rounded-full bg-foreground py-1 pr-1 pl-5 text-sm leading-normal font-medium text-canvas"
              >
                Our approach
                <span className="grid size-9 place-items-center rounded-full bg-canvas text-foreground transition-colors duration-180 ease-out group-hover:text-accent motion-reduce:transition-none">
                  <IconArrowUpRight aria-hidden="true" size={20} stroke={1.5} />
                </span>
              </a>
            </div>
          </div>
        </section>

        <section
          data-stack-panel
          id="about-values"
          aria-labelledby="about-values-title"
          className={`${stackPanelClassName} z-3 grid min-h-[calc(100svh-9rem)] gap-12 md:grid-cols-2 md:gap-x-[clamp(3rem,4.45vw,4rem)] motion-safe:supports-[animation-timeline:view()]:[view-timeline-name:--stack-values]`}
        >
          <div className="relative min-w-0 md:flex md:flex-col md:justify-between">
            <h3 id="about-values-title" className={displayTitleClassName}>
              Thoughtful
              <br />
              by design.
            </h3>
            <Image
              src="/big-logo.png"
              alt=""
              width={1622}
              height={1917}
              className="mt-10 h-auto w-9/10 max-w-120 opacity-32"
              sizes="(min-width: 768px) 40vw, 80vw"
            />
          </div>
          <div className="min-w-0">
            <p className="mx-auto mb-[clamp(3rem,7vw,6rem)] max-w-[25ch] text-center text-[clamp(1.75rem,2.5vw,2.5rem)] leading-[1.08] font-medium tracking-[-0.02em] text-pretty">
              Security is a human decision. Everything we build starts with the
              person on the other side of the screen.
            </p>
            <Accordion type="single" collapsible className="w-full">
              {values.map((value) => (
                <AccordionItem key={value.title} value={value.title}>
                  <AccordionTrigger className="min-h-20 cursor-pointer py-6 text-lg hover:text-accent [&>svg]:size-5 [&>svg]:duration-300">
                    {value.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
                    <p>{value.description}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </AboutStack>
    </section>
  );
}
