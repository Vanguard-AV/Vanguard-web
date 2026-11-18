"use client";

import Lenis from "lenis";
import { useEffect } from "react";

const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.075 });
    const controller = new AbortController();
    const options = { signal: controller.signal };

    function stopWheelInertia() {
      if (lenis.isScrolling !== "smooth") return;
      lenis.stop();
      lenis.start();
    }

    // Let native navigation take over if it starts during wheel momentum.
    function onKeyDown(event: KeyboardEvent) {
      if (!event.defaultPrevented && scrollKeys.has(event.key)) stopWheelInertia();
    }

    function onClick(event: MouseEvent) {
      if (
        !event.defaultPrevented &&
        event.target instanceof Element &&
        event.target.closest('a[href^="#"]')
      ) {
        stopWheelInertia();
      }
    }

    window.addEventListener("popstate", stopWheelInertia, options);
    window.addEventListener("keydown", onKeyDown, options);
    window.addEventListener("click", onClick, options);

    return () => {
      controller.abort();
      lenis.destroy();
    };
  }, []);

  return null;
}
