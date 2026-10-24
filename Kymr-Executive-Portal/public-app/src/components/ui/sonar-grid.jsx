import * as React from "react";
import { cn } from "@/lib/utils";

// SonarGrid - a decorative dot field that answers taps with expanding rings.
//
// Ported to JavaScript on 2026-09-08. This project is a shadcn project with
// `"tsx": false` in components.json, so the ui/ directory is .jsx by design and
// the TypeScript source was converted rather than the project migrated. Every
// prop the original typed is documented below in the same order; nothing else
// about the component changed.
//
// One thing worth knowing before using it here: the original defaults its
// colour to the theme's `text-primary`. THIS PROJECT NEVER DEFINES `--primary`
// - it has its own palette (--signal, --carbon, --silver) - so `text-primary`
// resolves to an invalid colour and the canvas would fall back to whatever it
// inherits. Always pass an explicit `color` in this codebase. The class is
// kept so the component stays portable to a project that does define it.
//
// Props:
//   spacing      distance between dots, CSS px
//   dotRadius    dot radius at rest, CSS px
//   baseOpacity  resting dot opacity (0-1); dots on a wavefront go to 1
//   color        any CSS colour. See the note above - pass one.
//   pingEvery    seconds between ambient pings; 0 disables them
//   speed        wavefront speed, CSS px per second
//   ringWidth    thickness of the wavefront, CSS px
//   amplitude    how much a dot grows at the wave peak (0 none, 2 triple)
//   interactive  emit a ping where the user taps or clicks
//   maxRings     maximum simultaneous rings; oldest dropped first
//   seedPing     start with one ring mid-expansion so the first frame shows it
//   pingArea     where ambient pings may spawn, as fractions [x0,y0,x1,y1]
//   maxDpr       ADDED HERE, not in the published component. It backs its
//                canvas at up to 2x, and at 2x a full-width field is several
//                million pixels cleared and repainted every frame - measured
//                at ~158ms/s of main thread on its own, which is a lot for
//                something decorative on a page whose speed has already been
//                a complaint. The field is soft dots with no edges and no
//                text, so the sample density buys nothing visible. Defaults
//                to 2 so nothing changes for a caller who does not pass it.
//
// It idles when no ring is alive, pauses off-screen and in hidden tabs, and
// renders a still grid under prefers-reduced-motion. Children render on top.

// The component's own ceiling, kept as the default so it behaves exactly as
// published. It is overridable per-instance via `maxDpr` - see the note on
// that prop below.
const MAX_DPR = 2;
const TAU = Math.PI * 2;

export function SonarGrid({
  spacing = 26,
  dotRadius = 1.4,
  baseOpacity = 0.28,
  color,
  pingEvery = 2.4,
  speed = 260,
  ringWidth = 90,
  amplitude = 2.2,
  interactive = true,
  maxRings = 6,
  seedPing = true,
  pingArea = [0.15, 0.2, 0.85, 0.8],
  maxDpr = MAX_DPR,
  className,
  children,
  ref,
  ...rest
}) {
  const hostRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const ringsRef = React.useRef([]);
  const refreshRef = React.useRef(() => {});

  // The render loop reads props through this ref so knob changes apply live
  // without restarting it.
  const opts = React.useRef({
    spacing, dotRadius, baseOpacity, pingEvery, speed, ringWidth,
    amplitude, interactive, maxRings, seedPing, pingArea, maxDpr,
  });
  opts.current = {
    spacing, dotRadius, baseOpacity, pingEvery, speed, ringWidth,
    amplitude, interactive, maxRings, seedPing, pingArea, maxDpr,
  };

  const setHost = React.useCallback(
    (node) => {
      hostRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let raf = 0;
    let timer = 0;
    let visible = true;
    let seeded = false;
    let stroke = "";
    let nextPing = performance.now() + opts.current.pingEvery * 1000;

    const readColor = () => {
      stroke = getComputedStyle(canvas).color;
    };

    const addRing = (x, y, born) => {
      readColor();
      const rings = ringsRef.current;
      rings.push({ x, y, born });
      while (rings.length > opts.current.maxRings) rings.shift();
    };

    const draw = (now) => {
      const o = opts.current;
      // seconds until a ring leaves the canvas
      const lifetime = (Math.hypot(width, height) + o.ringWidth) / o.speed;
      ringsRef.current = ringsRef.current.filter((r) => (now - r.born) / 1000 < lifetime);
      const live = ringsRef.current.map((r) => {
        const age = (now - r.born) / 1000;
        const radius = age * o.speed;
        return { x: r.x, y: r.y, radius, reach: radius + o.ringWidth, fade: 1 - age / lifetime };
      });

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = stroke;

      const cols = Math.ceil(width / o.spacing) + 1;
      const rows = Math.ceil(height / o.spacing) + 1;
      const offsetX = (width - (cols - 1) * o.spacing) / 2;
      const offsetY = (height - (rows - 1) * o.spacing) / 2;

      // Pass 1: every resting dot in a single path and a single fill.
      const hot = [];
      ctx.globalAlpha = o.baseOpacity;
      ctx.beginPath();
      for (let i = 0; i < cols; i++) {
        const cx = offsetX + i * o.spacing;
        for (let j = 0; j < rows; j++) {
          const cy = offsetY + j * o.spacing;
          let energy = 0;
          for (const r of live) {
            if (Math.abs(cx - r.x) > r.reach || Math.abs(cy - r.y) > r.reach) continue;
            const dist = Math.abs(Math.hypot(cx - r.x, cy - r.y) - r.radius);
            if (dist >= o.ringWidth) continue;
            const t = 1 - dist / o.ringWidth;
            const k = t * t * (3 - 2 * t) * r.fade; // smoothstep, fading with age
            if (k > energy) energy = k;
          }
          if (energy < 0.01) {
            ctx.moveTo(cx + o.dotRadius, cy);
            ctx.arc(cx, cy, o.dotRadius, 0, TAU);
          } else {
            hot.push(cx, cy, energy);
          }
        }
      }
      ctx.fill();

      // Pass 2: only the dots on a wavefront get their own alpha and radius.
      for (let k = 0; k < hot.length; k += 3) {
        const energy = hot[k + 2] ?? 0;
        ctx.globalAlpha = o.baseOpacity + (1 - o.baseOpacity) * energy;
        ctx.beginPath();
        ctx.arc(hot[k] ?? 0, hot[k + 1] ?? 0, o.dotRadius * (1 + o.amplitude * energy), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, opts.current.maxDpr || MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!seeded) {
        // One ring already mid-expansion inside the ping area, so the first
        // paint shows the idea rather than a static grid.
        seeded = true;
        const [x0, y0, x1, y1] = opts.current.pingArea;
        if (opts.current.seedPing && !reduceMotion.matches) {
          addRing(
            width * (x0 + (x1 - x0) * 0.68),
            height * (y0 + (y1 - y0) * 0.34),
            performance.now() - 500
          );
        }
      }
      draw(performance.now());
    };

    const scheduleIdle = (delay) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => tick(performance.now()), Math.max(16, delay));
    };

    const tick = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (reduceMotion.matches) {
        ringsRef.current = [];
        draw(now);
        return;
      }
      const o = opts.current;
      if (o.pingEvery > 0 && now >= nextPing) {
        const [x0, y0, x1, y1] = o.pingArea;
        addRing(
          width * (x0 + Math.random() * (x1 - x0)),
          height * (y0 + Math.random() * (y1 - y0)),
          now
        );
        nextPing = now + o.pingEvery * 1000;
      }
      draw(now);
      if (ringsRef.current.length > 0) raf = requestAnimationFrame(tick);
      else if (o.pingEvery > 0) scheduleIdle(nextPing - now);
    };

    const wake = () => {
      if (!raf) {
        window.clearTimeout(timer);
        raf = requestAnimationFrame(tick);
      }
    };

    refreshRef.current = () => {
      readColor();
      nextPing = Math.min(nextPing, performance.now() + opts.current.pingEvery * 1000);
      wake();
    };

    const onDown = (e) => {
      if (!opts.current.interactive || reduceMotion.matches) return;
      const rect = host.getBoundingClientRect();
      addRing(e.clientX - rect.left, e.clientY - rect.top, performance.now());
      wake();
    };
    const onVisibility = () => {
      if (!document.hidden) wake();
    };

    const ro = new ResizeObserver(resize);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible) wake();
      },
      { threshold: 0 }
    );
    const mo = new MutationObserver(() => refreshRef.current());

    readColor();
    resize();
    ro.observe(host);
    io.observe(host);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    host.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", wake);
    wake();

    return () => {
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      host.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", wake);
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      refreshRef.current = () => {};
    };
  }, []);

  // Prop changes while the loop is asleep still repaint immediately.
  React.useEffect(() => {
    refreshRef.current();
  }, [spacing, dotRadius, baseOpacity, color, pingEvery, speed, ringWidth, amplitude, interactive, maxRings, pingArea, maxDpr]);

  return (
    <div
      ref={setHost}
      data-slot="sonar-grid"
      className={cn("relative isolate overflow-hidden", interactive && "cursor-crosshair", className)}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="text-primary pointer-events-none absolute inset-0 -z-10 size-full"
        style={color ? { color } : undefined}
      />
      {children}
    </div>
  );
}

export default SonarGrid;
