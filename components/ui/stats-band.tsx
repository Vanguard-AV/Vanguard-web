"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { animate, useInView } from "motion/react";
import { useEffect, useId, useMemo, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { cn } from "@/lib/utils";
import { StatsBandVisual, type StatVisual } from "./stats-band-visual";
import styles from "./stats-band.module.css";

export type Stat = {
  label: string;
  value: number;
  detail: string;
  decimals?: number;
  notation?: "compact";
  prefix?: string;
  suffix?: string;
  source?: { label: string; href: string };
  visual?: StatVisual;
};

type StatsBandProps = {
  stats: readonly Stat[];
  title: string;
  description?: string;
  layout?: "plain" | "divided";
  duration?: number;
  className?: string;
  id?: string;
};

const compactUnits = [
  { scale: 1e12, unit: "T" },
  { scale: 1e9, unit: "B" },
  { scale: 1e6, unit: "M" },
  { scale: 1e3, unit: "K" },
];

function StatItem({
  stat,
  delay,
  duration,
  reducedMotion,
  divided,
}: {
  stat: Stat;
  delay: number;
  duration: number;
  reducedMotion: boolean;
  divided: boolean;
}) {
  const item = useRef<HTMLDivElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const chart = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const chartShown = useRef(false);
  const inView = useInView(item, { once: true, amount: 0.45 });
  const chartInView = useInView(chart, { once: true, amount: 0.75 });
  const { scale, unit } = (stat.notation === "compact" &&
    compactUnits.find(({ scale }) => Math.abs(stat.value) >= scale)) || {
    scale: 1,
    unit: "",
  };
  const decimals = stat.decimals ?? 0;
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals],
  );
  const finalDigits = formatter.format(stat.value / scale);

  useEffect(() => {
    const node = digits.current;
    if (!node || !inView) return;

    if (reducedMotion || finished.current || duration <= 0) {
      node.textContent = finalDigits;
      finished.current = true;
      return;
    }

    node.textContent = formatter.format(0);
    const animation = animate(0, stat.value / scale, {
      delay,
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => {
        node.textContent = formatter.format(value);
      },
      onComplete: () => {
        node.textContent = finalDigits;
        finished.current = true;
      },
    });

    return () => animation.stop();
  }, [
    delay,
    duration,
    finalDigits,
    formatter,
    inView,
    reducedMotion,
    scale,
    stat.value,
  ]);

  useEffect(() => {
    const node = chart.current;
    if (!node || !chartInView) return;

    if (reducedMotion || duration <= 0) {
      node.removeAttribute("data-animate");
    } else if (!chartShown.current) {
      node.setAttribute("data-animate", "");
    }
    chartShown.current = true;
  }, [chartInView, duration, reducedMotion]);

  return (
    <div
      ref={item}
      className={cn(
        "group/stat flex min-w-0 flex-col bg-surface motion-safe:transition-colors",
        divided
          ? "px-[clamp(1.25rem,1.85vw,2.5rem)] pt-6 pb-4 focus-within:bg-surface-hover hover:bg-surface-hover sm:pt-8 sm:pb-5"
          : "py-3",
      )}
    >
      <dt className="mt-4 text-base font-medium text-foreground">
        {stat.label}
      </dt>
      <dd className="order-first">
        <span className="sr-only">
          {stat.prefix}
          {formatter.format(stat.value)}
          {stat.suffix}
        </span>
        <span
          aria-hidden="true"
          data-stat-value=""
          className="inline-flex items-baseline text-[clamp(2.75rem,4.5vw,4rem)] leading-none font-medium tracking-[-0.035em] whitespace-nowrap text-foreground tabular-nums"
        >
          {stat.prefix && (
            <span className="text-[0.65em] text-accent">{stat.prefix}</span>
          )}
          <span className="inline-grid">
            <span className="invisible col-start-1 row-start-1 select-none">
              {finalDigits}
            </span>
            <span ref={digits} className="col-start-1 row-start-1">
              {finalDigits}
            </span>
          </span>
          {(unit || stat.suffix) && (
            <span className="text-[0.65em] text-accent">
              {unit}
              {stat.suffix}
            </span>
          )}
        </span>
      </dd>
      <dd className="mt-1 max-w-[30ch] text-sm leading-relaxed text-muted-foreground">
        {stat.detail}
      </dd>
      {stat.source && (
        <dd>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={stat.source.href}
            className="inline-flex min-h-10 items-center gap-1 rounded-sm text-sm text-muted-foreground underline decoration-outline underline-offset-4 hover:text-accent hover:decoration-current focus-visible:text-accent"
          >
            {stat.source.label}
            <IconArrowUpRight
              aria-hidden="true"
              className="size-3.5 shrink-0"
              stroke={1.5}
            />
          </a>
        </dd>
      )}
      {stat.visual && (
        <dd className="mt-auto pt-6 pb-1">
          <figure>
            <div
              ref={chart}
              data-kind={stat.visual.kind}
              style={{
                "--chart-delay": `${delay + 0.24}s`,
                "--count-duration": `${duration}s`,
              } as CSSProperties}
              className={cn(
                styles.chart,
                "text-accent/85 group-focus-within/stat:text-accent group-hover/stat:text-accent motion-safe:transition-colors",
              )}
            >
              <StatsBandVisual visual={stat.visual} />
            </div>
            <figcaption className="mt-2 text-xs text-muted-foreground">
              {stat.visual.caption}
            </figcaption>
          </figure>
        </dd>
      )}
    </div>
  );
}

export function StatsBand({
  stats,
  title,
  description,
  layout = "plain",
  duration = 1.6,
  className,
  id,
}: StatsBandProps) {
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  const divided = layout === "divided";

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        "bg-surface py-[clamp(3rem,6vw,6rem)] text-foreground selection:bg-accent selection:text-canvas",
        className,
      )}
    >
      <div>
        <header className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
          <h2
            id={titleId}
            tabIndex={-1}
            className="max-w-[12ch] text-[clamp(2.5rem,4.8vw,4.25rem)] leading-[1.02] font-medium tracking-[-0.02em] text-balance"
          >
            {title}
          </h2>
          {description && (
            <p className="max-w-[33ch] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </header>
        <dl
          className={cn(
            "mt-[clamp(1.75rem,4vw,3.25rem)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-(--stats-columns)",
            divided
              ? "gap-px border-y border-outline bg-outline"
              : "gap-x-8 gap-y-4",
          )}
          style={
            {
              "--stats-columns": `repeat(${Math.max(1, Math.min(stats.length, 4))}, minmax(0, 1fr))`,
            } as CSSProperties
          }
        >
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              stat={stat}
              delay={(index % 4) * 0.09}
              duration={duration}
              reducedMotion={reducedMotion}
              divided={divided}
            />
          ))}
        </dl>
      </div>
    </section>
  );
}
