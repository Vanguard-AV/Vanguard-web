import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const cardSpan = {
  wide: "lg:col-span-5",
  narrow: "lg:col-span-3",
  regular: "lg:col-span-4",
};

type BentoFeature = {
  title: string;
  description: string;
  visual: ReactNode;
  size?: keyof typeof cardSpan;
};

type MarketingFeatureBentoProps = {
  id: string;
  title: string;
  description: string;
  features: readonly BentoFeature[];
};

export function MarketingFeatureBento({
  id,
  title,
  description,
  features,
}: MarketingFeatureBentoProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="bg-canvas py-12 text-foreground selection:bg-accent selection:text-canvas sm:py-16 lg:grid lg:min-h-[calc(100svh-var(--site-header-height))] lg:items-center lg:py-4"
    >
      <div>
        <div className="mb-6 grid items-end gap-4 md:grid-cols-[3fr_2fr] md:gap-10 lg:mb-[clamp(1rem,calc(6svh-1.125rem),2.5rem)]">
          <h2
            id={titleId}
            tabIndex={-1}
            className="w-fit text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.98] font-medium tracking-[-0.02em] lg:text-[clamp(3rem,calc(10svh-0.75rem),5.5rem)]"
          >
            {title}
          </h2>
          <p className="max-w-[35ch] text-base leading-relaxed text-muted-foreground md:justify-self-end lg:[@media(min-height:45rem)]:text-lg">
            {description}
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-16" role="list">
          {features.map(({ title, description, visual, size = "regular" }) => (
            <li
              key={title}
              className={cn(
                "grid min-w-0 overflow-hidden rounded-xl border border-outline bg-surface sm:row-span-2 sm:grid-rows-subgrid sm:gap-y-0",
                cardSpan[size],
              )}
            >
              <div
                aria-hidden="true"
                className="grid min-h-28 place-items-center border-b border-outline bg-surface-raised px-4 py-4 text-muted-foreground lg:min-h-[clamp(4.5rem,calc(25svh-5rem),7rem)] lg:px-3 lg:py-1.5 xl:min-h-[clamp(4.5rem,calc(25svh-5rem),10rem)]"
              >
                {visual}
              </div>
              <div className="p-4 sm:p-5 lg:p-[clamp(0.75rem,calc(3svh-0.375rem),1rem)] xl:p-[clamp(0.75rem,calc(3svh-0.375rem),1.5rem)]">
                <h3 className="text-xl leading-tight font-medium tracking-[-0.02em] text-pretty lg:text-lg lg:[@media(min-height:42rem)]:text-xl xl:[@media(min-height:52rem)]:text-2xl">
                  {title}
                </h3>
                <p className="mt-2 max-w-[48ch] text-base leading-relaxed text-pretty text-muted-foreground lg:mt-1 lg:text-sm/5 lg:[@media(min-height:58rem)]:text-base/6 xl:[@media(min-height:45rem)]:text-base/6">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
