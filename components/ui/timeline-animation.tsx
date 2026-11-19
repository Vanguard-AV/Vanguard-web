"use client";

import { useInView } from "motion/react";
import { useRef, type ComponentPropsWithoutRef } from "react";

export function TimelineContent(props: ComponentPropsWithoutRef<"li">) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { amount: 0.15, once: true });

  return <li {...props} ref={ref} data-in-view={inView} />;
}
