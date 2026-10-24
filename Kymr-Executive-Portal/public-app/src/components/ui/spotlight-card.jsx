import { useEffect, useRef } from "react";

// ============================================================
// GLOW CARD
//
// A spotlight panel: the pointer's page position is written to CSS
// custom properties on the card, and a fixed-attachment radial
// gradient reads them for the surface, the border and the outer
// bloom. Because the gradient is fixed to the viewport, several
// cards share one light source and the highlight travels across
// them as one.
//
// This project is JavaScript, not TypeScript, so the component is
// authored as .jsx with the prop contract documented below rather
// than typed. It lives beside the rest of the ui/ primitives.
//
// Props:
//   glowColor   'blue' | 'purple' | 'green' | 'red' | 'orange'
//   size        'sm' | 'md' | 'lg'     (ignored when customSize)
//   width       number (px) or CSS length
//   height      number (px) or CSS length
//   customSize  true -> sizing comes from className or width/height
// ============================================================
const GLOW = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

const SIZES = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

// One stylesheet for every instance: the pseudo-elements cannot be
// expressed as inline styles, and duplicating them per card would
// put one <style> in the document for each panel on the page.
const GLOW_CSS = `
[data-glow]::before,
[data-glow]::after {
  pointer-events: none;
  content: "";
  position: absolute;
  inset: calc(var(--border-size) * -1);
  border: var(--border-size) solid transparent;
  border-radius: calc(var(--radius) * 1px);
  background-attachment: fixed;
  background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
  background-repeat: no-repeat;
  background-position: 50% 50%;
  mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
  -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
  mask-clip: padding-box, border-box;
  -webkit-mask-clip: padding-box, border-box;
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
}

[data-glow]::before {
  background-image: radial-gradient(
    calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
    calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
    hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)),
    transparent 100%
  );
  filter: brightness(2);
}

[data-glow]::after {
  background-image: radial-gradient(
    calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
    calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
    hsl(0 100% 100% / var(--border-light-opacity, 1)),
    transparent 100%
  );
}

[data-glow] [data-glow] {
  position: absolute;
  inset: 0;
  will-change: filter;
  opacity: var(--outer, 1);
  border-radius: calc(var(--radius) * 1px);
  border-width: calc(var(--border-size) * 20);
  filter: blur(calc(var(--border-size) * 10));
  background: none;
  pointer-events: none;
  border: none;
}

[data-glow] > [data-glow]::before {
  inset: -10px;
  border-width: 10px;
}

/* the spotlight is decoration: it does not follow a pointer that the
   visitor has asked to stop chasing them */
@media (prefers-reduced-motion: reduce) {
  [data-glow]::before,
  [data-glow]::after { opacity: 0.35; }
  [data-glow] [data-glow] { display: none; }
}
`;

let sheetMounted = false;

/** Mount the shared rules once per document. */
function useGlowSheet() {
  useEffect(() => {
    if (sheetMounted) return undefined;
    sheetMounted = true;
    const el = document.createElement("style");
    el.dataset.glowSheet = "true";
    el.textContent = GLOW_CSS;
    document.head.appendChild(el);
    return undefined;
  }, []);
}

export function GlowCard({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
}) {
  const cardRef = useRef(null);
  useGlowSheet();

  useEffect(() => {
    // Fine pointers only: on a touch device there is no hover, so the
    // listener would run for every drag and light nothing.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;

    let raf = 0;
    let x = 0;
    let y = 0;
    const write = () => {
      raf = 0;
      const el = cardRef.current;
      if (!el) return;
      el.style.setProperty("--x", x.toFixed(2));
      el.style.setProperty("--xp", (x / window.innerWidth).toFixed(3));
      el.style.setProperty("--y", y.toFixed(2));
      el.style.setProperty("--yp", (y / window.innerHeight).toFixed(3));
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      // one write per frame rather than one per event
      if (!raf) raf = requestAnimationFrame(write);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  // A named colour, or an explicit { base, spread } when the page has
  // its own accent to hold: the default spreads run 200-300 degrees of
  // hue across the viewport, which is right for a demo and wrong for a
  // brand with a single colour.
  const { base, spread } =
    typeof glowColor === "object" && glowColor !== null
      ? { base: glowColor.base ?? 0, spread: glowColor.spread ?? 0 }
      : GLOW[glowColor] ?? GLOW.blue;

  const style = {
    "--base": base,
    "--spread": spread,
    "--radius": "14",
    "--border": "3",
    "--backdrop": "hsl(0 0% 60% / 0.12)",
    "--backup-border": "var(--backdrop)",
    "--size": "200",
    "--outer": "1",
    "--border-size": "calc(var(--border, 2) * 1px)",
    "--spotlight-size": "calc(var(--size, 150) * 1px)",
    "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)),
      transparent
    )`,
    backgroundColor: "var(--backdrop, transparent)",
    backgroundSize:
      "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
    backgroundPosition: "50% 50%",
    backgroundAttachment: "fixed",
    border: "var(--border-size) solid var(--backup-border)",
    position: "relative",
    touchAction: "none",
    ...(width !== undefined ? { width: typeof width === "number" ? `${width}px` : width } : null),
    ...(height !== undefined
      ? { height: typeof height === "number" ? `${height}px` : height }
      : null),
  };

  return (
    <div
      ref={cardRef}
      data-glow
      style={style}
      className={`relative grid grid-rows-[1fr_auto] gap-4 rounded-2xl p-4 shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px] ${
        customSize ? "" : `${SIZES[size] ?? SIZES.md} aspect-[3/4]`
      } ${className}`}
    >
      <div data-glow />
      {children}
    </div>
  );
}

export default GlowCard;
