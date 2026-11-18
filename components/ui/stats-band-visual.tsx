import type { CSSProperties } from "react";
import { landPath, world } from "./stats-band-world";

export type StatVisual = {
  caption: string;
  summary: string;
} & (
  | { kind: "trend"; values: readonly number[] }
  | { kind: "strip"; highlighted: number; total: number }
  | {
      kind: "bars";
      values: readonly {
        label: string;
        value: number;
        highlight?: boolean;
      }[];
    }
  | { kind: "map"; points: readonly (readonly [number, number])[] }
);

function Trend({ values, summary }: Extract<StatVisual, { kind: "trend" }>) {
  const low = Math.min(...values);
  const range = Math.max(...values) - low || 1;
  const points = values.map((value, index) => ({
    x: 3 + (202 * index) / Math.max(values.length - 1, 1),
    y: 47 - ((value - low) / range) * 40,
  }));
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return null;

  const line = points
    .map(({ x, y }, index) => `${index ? "L" : "M"}${x} ${y}`)
    .join(" ");

  return (
    <svg
      role="img"
      aria-label={summary}
      viewBox="0 0 208 56"
      preserveAspectRatio="none"
      className="block h-14 w-full"
    >
      <path
        data-trend-area=""
        d={`${line} L${last.x} 56 H${first.x} Z`}
        fill="currentColor"
        opacity={0.12}
      />
      <path
        data-trend-line=""
        d={line}
        fill="none"
        pathLength={1}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <circle
        data-trend-point=""
        cx={last.x}
        cy={last.y}
        r={2.8}
        fill="currentColor"
      />
    </svg>
  );
}

function Strip({
  highlighted,
  total,
  summary,
}: Extract<StatVisual, { kind: "strip" }>) {
  const segments = 64;

  return (
    <svg
      role="img"
      aria-label={summary}
      viewBox="0 0 208 56"
      preserveAspectRatio="none"
      className="block h-14 w-full"
    >
      {Array.from({ length: segments }, (_, index) => {
        const isHighlighted = (index + 0.5) / segments <= highlighted / total;

        return (
          <rect
            key={index}
            data-highlighted={isHighlighted || undefined}
            x={index * 3.25}
            y={23}
            width={2.1}
            height={33}
            fill="currentColor"
            opacity={isHighlighted ? 1 : 0.52}
          />
        );
      })}
    </svg>
  );
}

function Bars({ values, summary }: Extract<StatVisual, { kind: "bars" }>) {
  const highest = Math.max(...values.map(({ value }) => value), 1);

  return (
    <div
      role="img"
      aria-label={summary}
      className="flex h-14 items-end"
      style={{ "--last-bar-index": values.length - 1 } as CSSProperties}
    >
      {values.map(({ label, value, highlight }, index) => (
        <div
          key={label}
          className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1"
        >
          <span
            data-bar=""
            data-highlighted={highlight || undefined}
            className="me-1 block bg-current"
            style={
              {
                height: `${(value / highest) * 72}%`,
                opacity: highlight ? 1 : 0.6,
                "--bar-index": index,
              } as CSSProperties
            }
          />
          <span className="truncate text-xs leading-3 tracking-tight text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function WorldMap({ points, summary }: Extract<StatVisual, { kind: "map" }>) {
  return (
    <svg
      role="img"
      aria-label={summary}
      viewBox={`0 0 ${world.columns} ${world.rows}`}
      className="block h-14 w-auto max-w-full"
    >
      <path
        data-map-land=""
        d={landPath}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.48}
        strokeLinecap="round"
        strokeDasharray="0.01 0.99"
        opacity={0.66}
      />
      {points.map(([longitude, latitude]) => {
        const x = (longitude + 180) / 360;

        return (
          <circle
            key={`${longitude},${latitude}`}
            data-map-pin=""
            cx={x * world.columns}
            cy={((world.north - latitude) / (world.north - world.south)) * world.rows}
            r={0.52}
            fill="currentColor"
            style={{ "--pin-delay": `${Math.round(x * 240)}ms` } as CSSProperties}
          />
        );
      })}
    </svg>
  );
}

export function StatsBandVisual({ visual }: { visual: StatVisual }) {
  switch (visual.kind) {
    case "trend":
      return <Trend {...visual} />;
    case "strip":
      return <Strip {...visual} />;
    case "bars":
      return <Bars {...visual} />;
    case "map":
      return <WorldMap {...visual} />;
  }
}
