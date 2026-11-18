import { IconPlus, IconQuote, IconStarFilled } from "@tabler/icons-react";
import styles from "./testimonial-bento.module.css";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
};

export function TestimonialBento({
  testimonials,
}: {
  testimonials: readonly Testimonial[];
}) {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="border-t border-outline bg-canvas py-16 text-foreground selection:bg-accent selection:text-canvas lg:grid lg:min-h-[calc(100svh-var(--site-header-height))] lg:content-center lg:py-3"
    >
      <div>
        <div className="mx-auto mb-10 max-w-xl text-center lg:mb-4">
          <h2
            id="testimonials-title"
            tabIndex={-1}
            className="text-4xl leading-none font-medium tracking-tight sm:max-lg:text-5xl"
          >
            Testimonials
          </h2>
          <p className="mt-4 text-balance text-muted-foreground lg:mt-2 lg:text-sm">
            Perspectives on Vanguard from security, engineering, and business leaders.
          </p>
        </div>

        <ul role="list" className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-5 lg:pb-4">
          {testimonials.map(({ name, role, company, quote, rating }) => (
            <li key={name} className={`${styles.card} relative min-w-0`}>
              <IconPlus
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 z-10 size-4 -translate-1/2 text-muted-foreground"
                stroke={1.25}
              />
              <figure className="flex h-full flex-col justify-between gap-6 px-4 py-6 sm:px-6 lg:gap-2.5 lg:px-3 lg:py-2.5">
                <blockquote className="flex items-start gap-3 text-base/relaxed text-muted-foreground lg:block lg:text-sm/[1.375]">
                  <IconQuote
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 lg:me-1.5 lg:mt-0 lg:inline lg:size-4 lg:align-text-bottom"
                    stroke={1.5}
                  />
                  <p className="wrap-anywhere lg:inline">{quote}</p>
                </blockquote>

                <figcaption className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-xs font-medium text-foreground ring-1 ring-outline ring-offset-2 ring-offset-canvas"
                  >
                    {name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0 flex-1 wrap-anywhere lg:grid lg:grid-cols-[1fr_auto] lg:gap-x-2">
                    <p className="text-sm leading-tight font-medium">{name}</p>
                    <p className="text-xs/4 text-muted-foreground lg:col-span-2">
                      {role}, <span className="text-foreground/85">{company}</span>
                    </p>
                    <div className="mt-1.5 flex gap-0.5 text-accent lg:col-start-2 lg:row-start-1 lg:mt-0 lg:self-center">
                      <span className="sr-only">{rating} out of 5 stars</span>
                      {Array.from({ length: rating }, (_, star) => (
                        <IconStarFilled key={star} size={10} aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
