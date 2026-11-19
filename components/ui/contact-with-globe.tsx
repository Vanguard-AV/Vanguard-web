"use client";

import { geoGraticule, geoOrthographic, geoPath } from "d3";
import { useInView } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldAtlas from "world-atlas/land-110m.json";
import { useReducedMotion } from "@/lib/reduced-motion";
import { cn } from "@/lib/utils";
import { ContactForm, type ContactFormProps } from "./contact-form";

// World Atlas redistributes Natural Earth's 1:110m land boundaries as TopoJSON.
const topology = worldAtlas as Topology<{ land: GeometryCollection }>;
const land = feature(topology, topology.objects.land);
const graticule = geoGraticule().step([20, 20])();
const sphere = { type: "Sphere" } as const;

function ContactGlobe() {
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; x: number } | null>(null);
  const isInView = useInView(frame, { amount: 0.25, once: true });
  const reducedMotion = useReducedMotion();
  const [longitude, setLongitude] = useState(-15);
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    if (introFinished || !isInView || reducedMotion) return;

    const timer = window.setInterval(() => {
      setLongitude((current) => (current + 0.2) % 360);
    }, 50);
    const finish = window.setTimeout(() => setIntroFinished(true), 4000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(finish);
    };
  }, [introFinished, isInView, reducedMotion]);

  function startDrag(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || !event.isPrimary) return;
    drag.current = { pointerId: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIntroFinished(true);
  }

  function moveGlobe(event: PointerEvent<SVGSVGElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.current.x;
    drag.current.x = event.clientX;
    setLongitude((current) => (current + delta * 0.5) % 360);
  }

  const projection = geoOrthographic()
    .rotate([longitude, -18])
    .translate([280, 244])
    .scale(208)
    .precision(0.5);
  const path = geoPath(projection).digits(1);

  return (
    <div
      ref={frame}
      data-slot="contact-globe"
      className="relative aspect-square min-w-0 overflow-hidden rounded-xl border border-accent/20 bg-[radial-gradient(ellipse_at_50%_85%,var(--color-surface-selected),var(--color-canvas)_80%)] md:aspect-[1.65]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 560 344"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full touch-pan-y cursor-grab active:cursor-grabbing"
        onPointerDown={startDrag}
        onPointerMove={moveGlobe}
        onLostPointerCapture={() => { drag.current = null; }}
      >
        <path d={path(sphere) ?? undefined} className="fill-surface/60 stroke-accent/65" strokeWidth={1.2} />
        <path data-land d={path(land) ?? undefined} className="fill-accent/15 stroke-accent/75" strokeWidth={1} />
        <path d={path(graticule) ?? undefined} className="fill-none stroke-accent/25" strokeWidth={0.8} />
      </svg>
    </div>
  );
}

type ContactWithGlobeProps = Omit<ContactFormProps, "eyebrow" | "formTitle" | "layout">;

export default function ContactWithGlobe({ details, ...props }: ContactWithGlobeProps) {
  return (
    <ContactForm
      {...props}
      eyebrow={null}
      layout="heading-above"
      formTitle="Send a message"
      details={(
        <div className={cn("grid gap-4 md:gap-5", details && "grid-cols-[minmax(0,1fr)_minmax(6rem,38%)] items-center md:grid-cols-1")}>
          {details && (
            <div>
              <h3 className="mb-2 text-lg font-medium tracking-tight sm:text-xl">Direct channels</h3>
              {details}
            </div>
          )}
          <ContactGlobe />
        </div>
      )}
    />
  );
}
