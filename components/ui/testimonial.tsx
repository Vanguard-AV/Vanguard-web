"use client";

import { IconPlayerPause, IconPlayerPlay, IconStarFilled } from "@tabler/icons-react";
import Image from "next/image";
import { Tooltip } from "radix-ui";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import styles from "./testimonial.module.css";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  image?: string;
  rating?: number;
};

type ClientFeedbackProps = {
  testimonials: readonly Testimonial[];
  title: string;
  description: string;
  id?: string;
};

function TestimonialCard({ testimonial, duplicate }: {
  testimonial: Testimonial;
  duplicate: boolean;
}) {
  const { name, role, company, quote, image, rating } = testimonial;
  const [open, setOpen] = useState(false);

  return (
    <li className="w-64 shrink-0 md:w-72">
      <Card className="h-full rounded-xl shadow-none">
        <Tooltip.Root open={open} onOpenChange={setOpen}>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              tabIndex={duplicate ? -1 : undefined}
              className="relative flex h-full w-full cursor-pointer flex-col gap-2 rounded-[inherit] p-4 text-left hover:bg-surface-hover focus-visible:outline-offset-[-2px]"
              onMouseDown={duplicate ? (event) => event.preventDefault() : undefined}
              onClick={(event) => {
                event.preventDefault();
                setOpen(true);
              }}
            >
              <span className="flex items-center gap-2.5">
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 shrink-0 rounded-full bg-surface-raised object-cover"
                  />
                ) : (
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-selected text-xs font-medium text-accent">
                    {name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}
                  </span>
                )}
                <span className="min-w-0 wrap-anywhere">
                  <span className="block text-sm font-medium">{name}</span>
                  <span className="block text-xs text-muted-foreground">{role}, {company}</span>
                </span>
              </span>
              <span className="line-clamp-2 text-sm/5 wrap-anywhere">{quote}</span>
              {rating !== undefined && (
                <span className="mt-auto flex gap-0.5 pt-0.5 text-accent">
                  <span className="sr-only">{rating} out of 5 stars</span>
                  {Array.from({ length: rating }, (_, star) => (
                    <IconStarFilled key={star} size={10} aria-hidden="true" />
                  ))}
                </span>
              )}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              sideOffset={8}
              collisionPadding={12}
              data-lenis-prevent
              className="z-50 max-h-[var(--radix-tooltip-content-available-height)] max-w-[min(26rem,var(--radix-tooltip-content-available-width))] overflow-y-auto rounded-xl border border-outline bg-surface-hover px-3 py-2.5 text-sm/5 wrap-anywhere text-foreground sm:px-4 sm:py-3"
            >
              {quote}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Card>
    </li>
  );
}

function TestimonialRow({ testimonials, reverse = false }: {
  testimonials: readonly Testimonial[];
  reverse?: boolean;
}) {
  if (!testimonials.length) return null;

  return (
    <div className={styles.row} data-reverse={reverse}>
      <div className={styles.track}>
        {[false, true].map((duplicate) => (
          <ul key={String(duplicate)} role="list" className={styles.group} aria-hidden={duplicate || undefined}>
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={`${testimonial.name}-${testimonial.company}`}
                testimonial={testimonial}
                duplicate={duplicate}
              />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function ClientFeedback({
  testimonials,
  title,
  description,
  id = "testimonials",
}: ClientFeedbackProps) {
  const midpoint = Math.ceil(testimonials.length / 2);
  const [paused, setPaused] = useState(false);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="border-t border-outline bg-canvas py-16 text-foreground selection:bg-accent selection:text-canvas lg:py-20"
    >
      <header className="mx-auto mb-6 max-w-2xl text-center">
        <h2
          id={`${id}-title`}
          tabIndex={-1}
          className="text-4xl leading-none font-medium tracking-tight text-balance sm:text-5xl"
        >
          {title}
        </h2>
        <p className="mt-4 text-balance text-muted-foreground">{description}</p>
      </header>

      <Tooltip.Provider delayDuration={250}>
        <div className={`${styles.marquee} mx-auto max-w-[60rem]`} data-paused={paused}>
          {testimonials.length > 0 && (
            <div className={styles.controls}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground"
                aria-label={paused ? "Resume testimonial scrolling" : "Pause testimonial scrolling"}
                onClick={() => setPaused((wasPaused) => !wasPaused)}
              >
                {paused ? <IconPlayerPlay size={14} /> : <IconPlayerPause size={14} />}
                {paused ? "Resume" : "Pause"}
              </Button>
            </div>
          )}
          <TestimonialRow testimonials={testimonials.slice(0, midpoint)} />
          <TestimonialRow testimonials={testimonials.slice(midpoint)} reverse />
        </div>
      </Tooltip.Provider>
    </section>
  );
}
