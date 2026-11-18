import { IconArrowUpRight } from "@tabler/icons-react";
import { Instrument_Serif } from "next/font/google";
import { GlassBackground } from "@/components/glass-background";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative isolate grid min-h-[min(38rem,88svh)] grid-cols-1 place-items-center overflow-hidden pt-28 pb-16 text-center selection:bg-accent selection:text-canvas sm:min-h-svh sm:pt-36 sm:pb-24"
    >
      <GlassBackground />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-canvas/25"
      />

      <div className="relative flex w-full flex-col items-center">
        <h1
          id="hero-title"
          tabIndex={-1}
          className="text-[clamp(2.25rem,10.6vw,2.75rem)] leading-[1.08] font-medium tracking-[-0.035em] text-foreground sm:text-[clamp(2.75rem,7.8vw,6rem)]"
        >
          <span className="block text-balance">Guardians of the</span>
          <span
            className={`${instrumentSerif.className} block text-[1.15em] leading-[1.06] font-normal tracking-[-0.025em] text-balance`}
          >
            digital frontier.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-pretty text-foreground sm:mt-8 sm:text-lg">
          Know what to trust before you click. Vanguard brings files, links,
          messages, and code into one place for clearer threat assessment and
          confident next steps.
        </p>

        <button
          type="button"
          className="group mt-7 inline-flex min-h-12 items-center gap-5 rounded-full bg-foreground py-1.5 pr-1.5 pl-6 text-sm font-medium text-canvas transition-colors duration-150 hover:bg-white active:bg-foreground/90 motion-reduce:transition-none sm:mt-9"
        >
          Get Started
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-canvas text-foreground">
            <IconArrowUpRight
              aria-hidden="true"
              size={20}
              stroke={1.5}
              className="motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
            />
          </span>
        </button>
      </div>
    </section>
  );
}
