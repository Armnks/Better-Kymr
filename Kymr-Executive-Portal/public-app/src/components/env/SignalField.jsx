import { useEffect, useRef } from "react";

// ============================================================
// THE LIVING SIGNAL
//
// One persistent environmental layer for every chapter after the
// hero. The landing shader belongs to the hero and is untouched;
// this is the ground the rest of the page stands on, and there is
// exactly one of it, so the site reads as one continuous space
// rather than five unrelated animated backgrounds.
//
// The material is a particle field: fine silver-white points drawn
// as short curved trails, travelling along a flow that either
// converges on a point or opens away from it. Depth is real - a
// particle's lane carries a z value that scales its size, its
// speed and its brightness, and an atmospheric falloff dims the
// far ones toward the ground colour.
//
// The field has states, not variants. `setFieldMode` writes into a
// module-level target object and the render loop eases the live
// parameters toward it, so a chapter change is a grade, never a
// cut, and never a React render. Nothing here goes through state:
// at 60fps that would be 60 renders a second of the whole page.
//
//   fracture      lanes separate, distort, briefly lose alignment
//   capabilities  five streams appear and braid together
//   archive       the field thins to suspended dust in a deep room
//   process       the streams converge on one forward trajectory
//   contact       the signal settles, calm and concentrated
// ============================================================

// Canonical states. Every number is a target the loop eases toward.
//
//   spread   angular width of the fan, radians
//   r0/r1    start and end radius as a fraction of the viewport
//   swirl    angular drift across a particle's life
//   braid    amplitude of the weave between lanes
//   split    lane-group separation (the fracture's damage)
//   drift    how far a lane wanders off its own line
//   speed    life rate
//   glow     share of particles carrying the signal colour
//   density  share of the pool actually drawn
//   trail    reserved: every state now draws points, never paths
//   cx/cy    convergence point, viewport fractions
const MODES = {
  fracture: {
    spread: 2.9, r0: 1.25, r1: 0.42, swirl: 0.34, braid: 0.10,
    split: 0.26, drift: 0.18, speed: 0.85, glow: 0.06, density: 1, trail: 0,
    cx: 0.5, cy: 0.5, groups: 5,
  },
  capabilities: {
    spread: 2.1, r0: 1.3, r1: 0.2, swirl: 0.46, braid: 0.5,
    split: 0.0, drift: 0.04, speed: 0.9, glow: 0.08, density: 1, trail: 0,
    cx: 0.5, cy: 0.5, groups: 5,
  },
  archive: {
    // The corridor is drawn with depth, not with rays. An outward
    // radius ramp plus a drawn trail is a starburst: every particle
    // becomes a straight line pointing at the vanishing point, and
    // twelve photographs end up behind a wireframe. Here the trail is
    // zero, so the particles render as suspended dust that drifts
    // outward and fades - the room stays deep, and nothing straight
    // is ever drawn behind the work.
    spread: 6.28, r0: 0.1, r1: 1.4, swirl: 0.1, braid: 0.04,
    split: 0.0, drift: 0.04, speed: 0.16, glow: 0.03, density: 0.55, trail: 0,
    cx: 0.5, cy: 0.5, groups: 1,
  },
  // the fracture resolving: the same field, made coherent
  resolve: {
    spread: 1.9, r0: 1.0, r1: 0.14, swirl: 0.1, braid: 0.06,
    split: 0.0, drift: 0.01, speed: 0.5, glow: 0.09, density: 0.85, trail: 0,
    cx: 0.5, cy: 0.5, groups: 1,
  },
  process: {
    spread: 1.5, r0: 1.25, r1: 0.08, swirl: 0.2, braid: 0.14,
    split: 0.0, drift: 0.03, speed: 1.0, glow: 0.07, density: 0.9, trail: 0,
    cx: 0.62, cy: 0.5, groups: 1,
  },
  contact: {
    spread: 2.4, r0: 1.0, r1: 0.05, swirl: 0.12, braid: 0.05,
    split: 0.0, drift: 0.02, speed: 0.35, glow: 0.12, density: 0.5, trail: 0,
    cx: 0.5, cy: 0.45, groups: 1,
  },
};

const KEYS = Object.keys(MODES.fracture);
const target = { ...MODES.fracture, px: 0, py: 0, amp: 0 };
const live = { ...target };

let currentMode = "fracture";

/** Grade the field to a chapter state. Safe to call with anything. */
export function setFieldMode(mode) {
  const m = MODES[mode];
  if (!m || mode === currentMode) return;
  currentMode = mode;
  KEYS.forEach((k) => {
    target[k] = m[k];
  });
}

/** Pointer displacement, normalised -1..1. Capped in the loop. */
export function setFieldPointer(x, y) {
  target.px = x;
  target.py = y;
}

// Pointer travel is a nudge, not a parallax rig: the brief caps the
// perceived movement at 12-18px and this is the whole budget.
const POINTER_PX = 15;

// One breath. Long enough to read as atmosphere rather than a pulse.
const BREATH_MS = 15000;

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Where a particle sits, in viewport pixels.
 *
 * Polar around the convergence point, because every state the brief
 * asks for - converging, braiding, opening into a corridor - is the
 * same motion with a different radius ramp and a different weave.
 */
function place(p, u, P, W, H, t) {
  const R = Math.max(W, H);
  const group = P.groups > 1 ? Math.floor(p.lane * P.groups) : 0;
  const inGroup = P.groups > 1 ? (p.lane * P.groups) % 1 : p.lane;

  // lane angle: fanned across the spread, then pushed apart by split
  // so the five damaged runs of the fracture read as separate paths
  const laneA = (p.lane - 0.5) * P.spread;
  const splitA = P.split * ((group % 2 ? 1 : -1) * (0.35 + inGroup * 0.3));

  const e = easeInOut(u);
  const swirl = P.swirl * e;
  // the braid: lanes weave through each other on the way in
  const weave = P.braid * Math.sin(u * Math.PI * 2 + group * 1.9 + p.seed * 6.283) * (1 - u * 0.4);
  // a slow wander so no two particles trace the same line
  const wander = P.drift * Math.sin(t * 0.0004 + p.seed * 12.9) * (0.4 + u);

  const a = -Math.PI / 2 + laneA + splitA + swirl + weave + wander;
  const r = lerp(P.r0, P.r1, e) * R * 0.5;

  return {
    x: P.cx * W + Math.cos(a) * r * 1.35,
    y: P.cy * H + Math.sin(a) * r,
    // depth: near the convergence point is far away when the field
    // converges, and close to the viewer when it opens
    z: P.r1 > P.r0 ? e : 1 - e,
  };
}

export default function SignalField({ activeRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      // 1.35, not 2. This is a soft particle field with no hard edges and
      // no text, so the extra sample density is invisible - but at 2x on a
      // 1440x900 viewport it means clearing and repainting 5.2 million
      // pixels every frame instead of 2.4 million.
      dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // The pool is sized to the viewport, not fixed: a laptop should
    // not pay for a 4K field. `density` then draws a share of it, so
    // a chapter can thin the air without reallocating anything.
    const COUNT = Math.round(Math.min(300, Math.max(140, (W * H) / 6200)));
    const parts = Array.from({ length: COUNT }, (_, i) => ({
      lane: (i + 0.5) / COUNT,
      u: Math.random(),
      rate: 0.045 + Math.random() * 0.075,
      seed: Math.random(),
      // a few particles carry the signal colour instead of silver
      hot: Math.random(),
      size: 0.5 + Math.random() * 0.9,
    }));

    let raf = 0;
    let last = performance.now();
    let running = true;

    // The field breathes over seconds and drifts slowly; it does not need
    // a frame every 16ms. Capping it at ~30fps halves its cost and is not
    // perceptible on motion this slow. The pointer parallax still eases
    // toward its target using real elapsed time, so it stays smooth.
    const MIN_FRAME_MS = 1000 / 30;
    let lastPaint = 0;

    const draw = (now) => {
      if (now - lastPaint < MIN_FRAME_MS) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastPaint = now;
      // A rAF timestamp is the frame's start time and can precede a
      // performance.now() read taken moments earlier when the loop was
      // armed. An unclamped negative dt turns the easing lerp below
      // into an extrapolation, which walked `density` past 1 and then
      // indexed past the end of the pool.
      const dt = Math.max(0, Math.min(48, now - last));
      last = now;

      // ease the live parameters toward the chapter's targets
      const k = reduce ? 1 : 1 - Math.exp(-dt / 420);
      KEYS.forEach((key) => {
        live[key] = lerp(live[key], target[key], k);
      });
      live.px = lerp(live.px, target.px, 1 - Math.exp(-dt / 220));
      live.py = lerp(live.py, target.py, 1 - Math.exp(-dt / 220));

      // ambient breath, one slow cycle, no flashing
      const breath = reduce ? 1 : 0.86 + 0.14 * Math.sin((now / BREATH_MS) * Math.PI * 2);

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      const ox = live.px * POINTER_PX;
      const oy = live.py * -POINTER_PX;
      const shown = Math.min(COUNT, Math.round(COUNT * live.density));

      for (let i = 0; i < shown; i += 1) {
        const p = parts[i];
        if (!reduce) {
          p.u += (p.rate * live.speed * dt) / 1000;
          if (p.u > 1) p.u -= 1;
        }

        // Points, never paths. A drawn trail on a radial flow is a
        // straight stub aimed at the convergence point: at any density
        // the field reads as rays, scratches and perspective guides
        // laid across the type. Suspended points keep the depth and
        // the drift without drawing a line anywhere on the site.
        const DOTS = live.trail < 0.03;
        const TRAIL = DOTS ? 1 : 7;
        const span = live.trail;
        let a0 = null;
        ctx.beginPath();
        for (let s = 0; s < TRAIL; s += 1) {
          const u = p.u - (s / (TRAIL - 1)) * span;
          if (u < 0 || u > 1) break;
          const q = place(p, u, live, W, H, now);
          const x = q.x + ox * (0.4 + q.z);
          const y = q.y + oy * (0.4 + q.z);
          if (s === 0) {
            a0 = q;
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        if (!a0) continue;
        const hx = a0.x + ox * (0.4 + a0.z);
        const hy = a0.y + oy * (0.4 + a0.z);

        // atmospheric falloff: distance reads as light lost, and the
        // head of the field is never brighter than the type over it
        const depth = 0.25 + a0.z * 0.75;
        const alpha = Math.min(0.95, depth * depth * 1.5 * breath);
        const hot = p.hot < live.glow;
        ctx.strokeStyle = hot
          ? `rgba(255, 88, 48, ${alpha * 0.95})`
          : `rgba(226, 232, 236, ${alpha * 0.82})`;
        ctx.lineWidth = p.size * (0.5 + depth * 1.05);
        ctx.stroke();

        // the brighter signal particles carry a head
        if (hot) {
          ctx.beginPath();
          ctx.arc(hx, hy, p.size * 0.9, 0, 6.283);
          ctx.fillStyle = `rgba(255, 110, 70, ${alpha})`;
          ctx.fill();
        }
      }

      if (reduce) return;
      raf = requestAnimationFrame(draw);
    };

    // Offscreen work is wasted work. The field only runs while the
    // post-hero page is on screen and the tab is visible.
    const start = () => {
      if (raf || !running || reduce) return;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisible = () => {
      if (document.hidden) stop();
      else if (activeRef.current) start();
    };

    const onGate = (e) => {
      running = Boolean(e.detail);
      if (running && !document.hidden) start();
      else stop();
    };

    const onResize = () => {
      resize();
      if (reduce) draw(performance.now());
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("kymr:field-active", onGate);

    if (reduce) {
      // reduced motion gets one composed frame, held
      KEYS.forEach((key) => {
        live[key] = target[key];
      });
      draw(performance.now());
    } else if (activeRef.current) {
      start();
    }

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("kymr:field-active", onGate);
    };
  }, [activeRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="signal-field"
      className="signal-field"
    />
  );
}
