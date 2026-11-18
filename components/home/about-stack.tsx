"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function AboutStack({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panels = Array.from(
      container.current?.querySelectorAll<HTMLElement>("[data-stack-panel]") ?? [],
    );

    function updateOffsets() {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

      for (const panel of panels) {
        // Tall panels scroll to their bottom before pinning, keeping every line reachable.
        const top = Math.min(7 * rem, window.innerHeight - panel.offsetHeight - 1.5 * rem);
        panel.style.setProperty("--stack-top", `${top}px`);
      }
    }

    const observer = new ResizeObserver(updateOffsets);
    panels.forEach((panel) => observer.observe(panel));
    window.addEventListener("resize", updateOffsets);
    updateOffsets();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOffsets);
    };
  }, []);

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
