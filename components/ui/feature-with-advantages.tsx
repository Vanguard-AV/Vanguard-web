import { Check } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FeatureAdvantageItem {
  id?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  href?: string;
}

export interface FeatureProps {
  badge?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerExtra?: React.ReactNode;
  items?: readonly FeatureAdvantageItem[];
  className?: string;
  containerClassName?: string;
  gridClassName?: string;
}

const DEFAULT_ITEMS: readonly FeatureAdvantageItem[] = [
  {
    id: "easy-1",
    title: "Easy to use",
    description: "We've made it easy to use and understand.",
  },
  {
    id: "fast-1",
    title: "Fast and reliable",
    description: "We've made it fast and reliable.",
  },
  {
    id: "modern-1",
    title: "Beautiful and modern",
    description: "We've made it beautiful and modern.",
  },
  {
    id: "easy-2",
    title: "Easy to use",
    description: "We've made it easy to use and understand.",
  },
  {
    id: "fast-2",
    title: "Fast and reliable",
    description: "We've made it fast and reliable.",
  },
  {
    id: "modern-2",
    title: "Beautiful and modern",
    description: "We've made it beautiful and modern.",
  },
];

function Feature({
  badge = "Platform",
  title = "Something new!",
  description = "Managing a small business today is already tough.",
  headerExtra,
  items = DEFAULT_ITEMS,
  className,
  containerClassName,
  gridClassName,
}: FeatureProps) {
  const hasHeaderText = badge !== null || title !== null || description !== null;

  return (
    <div className={cn("w-full py-20 lg:py-40", className)}>
      <div className={cn("container mx-auto", containerClassName)}>
        <div className="flex flex-col items-start gap-4">
          {hasHeaderText && (
            <>
              {badge !== null && (
                <div>
                  {typeof badge === "string" ? <Badge>{badge}</Badge> : badge}
                </div>
              )}
              {(title !== null || description !== null) && (
                <div className="flex flex-col gap-2">
                  {title !== null && (
                    <h2 className="font-regular text-3xl tracking-tighter md:text-5xl lg:max-w-xl">
                      {title}
                    </h2>
                  )}
                  {description !== null && (
                    <p className="max-w-xl text-lg leading-relaxed tracking-tight text-muted-foreground lg:max-w-xl">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {headerExtra}

          <div
            className={cn(
              "flex w-full flex-col gap-10",
              hasHeaderText ? "pt-12" : "pt-4",
            )}
          >
            <div
              className={cn(
                "grid grid-cols-1 items-start gap-10 sm:grid-cols-2 lg:grid-cols-3",
                gridClassName,
              )}
            >
              {items.map((item, index) => {
                const content = (
                  <>
                    {item.icon ?? (
                      <Check
                        aria-hidden="true"
                        className="mt-1.5 h-4 w-4 shrink-0 text-primary"
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="text-base font-medium text-foreground motion-safe:transition-colors group-hover:text-accent">
                        {item.title}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      {item.meta && <div className="pt-1">{item.meta}</div>}
                      {item.footer && <div className="pt-1.5">{item.footer}</div>}
                    </div>
                  </>
                );

                const key = item.id ?? `feature-item-${index}`;

                if (item.href) {
                  return (
                    <Link
                      key={key}
                      href={item.href}
                      className="group flex w-full flex-row items-start gap-4 rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div
                    key={key}
                    className="flex w-full flex-row items-start gap-6"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };
