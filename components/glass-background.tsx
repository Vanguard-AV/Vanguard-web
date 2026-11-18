/**
 * Still background rendered in https://ui.wensity.com/components/glass-stripes.
 * Theme: Emerald. Glass preset: Frosted. Live component props:
 * stripeCount={14} angle={36} lightScale={1.00} spread={0.10}
 * glass={{ refraction: 1.50, thickness: 1.40, blur: 0.80, dispersion: 1.0 }}
 * interactive={false} pointerStrength={0.30}
 */
export function GlassBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-canvas before:absolute before:inset-x-0 before:top-[calc(50%+2rem)] before:mx-auto before:aspect-[1065/555] before:w-[min(100%,calc(100svh*1065/555))] before:-translate-y-1/2 before:bg-[url('/emerald-frosted-desktop.webp')] before:bg-contain before:bg-center before:bg-no-repeat before:[mask-image:linear-gradient(transparent,#000_6%,#000_94%,transparent)] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_16rem_9rem_at_50%_54%,rgb(8_8_10/44%)_24%,transparent)] max-sm:portrait:before:aspect-[480/560] max-sm:portrait:before:w-[min(100%,480px)] max-sm:portrait:before:scale-110 max-sm:portrait:before:bg-[url('/emerald-frosted-mobile.webp')]"
    />
  );
}

