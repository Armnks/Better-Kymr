import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { CONCEPTS } from "@/data/concepts";
import { masterFor } from "@/data/media";

// ============================================================
// THE CAMPAIGN FRAME
//
// One campaign master, cut into five pieces that can be taken hold
// of and pulled out of the picture. It is the tactile half of the
// System chapter and it carries no information of its own: every
// service and deliverable is readable in the columns beside it,
// with nothing to drag and nothing to discover.
//
// The seams are hairlines now, not bands. The pieces sit a few
// pixels off the whole so the frame reads as broken, and the image
// stays aligned across the cuts.
//
// Dragging is deliberately inert as far as the rest of the chapter
// is concerned: it moves pieces and nothing else. It cannot change
// which discipline is selected, cannot hide anything, and cannot
// produce a completion state. Selecting a discipline works the
// other way round and lifts one piece for a moment, which is a
// response, not a claim that the piece is that discipline.
//
// One rAF loop owns all five bodies. Pointer capture, a 10px
// hysteresis so a scroll is never a drag, velocity on release,
// friction, and a critically damped return that never overshoots.
// ============================================================

// The image the chapter breaks. One existing archive master, 4/3.
const SOURCE = CONCEPTS[4];

// The problem statements this chapter used to lead with. They are no
// longer part of the presentation - the disciplines are - but the
// writing is kept here rather than thrown away, and the geometry is
// still what cuts the frame.
const CUTS = [
  {
    k: "fatigue",
    name: "Creative fatigue",
    line: "The same idea, run until it stops working.",
    cost: "The concept keeps running long after it has stopped earning attention.",
    tell: "Nothing has changed in the work, and the numbers move anyway.",
    clip: "polygon(0% 0%, 36% 0%, 30% 55%, 36% 100%, 0% 100%)",
    push: [-1, -0.35],
  },
  {
    k: "fragmented",
    name: "Fragmented strategy and execution",
    line: "The brief and the edit never meet.",
    cost: "The angle agreed at the start is not the angle that reaches the cut.",
    tell: "Every round reopens a decision that was already made.",
    clip: "polygon(36% 0%, 68% 0%, 62% 44%, 30% 55%)",
    push: [-0.15, -1],
  },
  {
    k: "slow",
    name: "Slow production",
    line: "The window closes before the work lands.",
    cost: "The moment the work was built for has passed by the time it ships.",
    tell: "The brief is answered, and answered late.",
    clip: "polygon(68% 0%, 100% 0%, 100% 40%, 62% 44%)",
    push: [0.85, -0.8],
  },
  {
    k: "hollow",
    name: "Work that looks good and holds nobody",
    line: "Craft aimed at the wrong second.",
    cost: "The frame is finished and the opening seconds ask nothing of anyone.",
    tell: "It is admired internally and skipped everywhere else.",
    clip: "polygon(62% 44%, 100% 40%, 100% 100%, 70% 100%)",
    push: [1, 0.5],
  },
  {
    k: "blind",
    name: "Too few variations to learn from",
    line: "No signal comes back at all.",
    cost: "One version runs, so there is nothing the next brief can be written from.",
    tell: "The next round starts from opinion, not from what happened.",
    clip: "polygon(30% 55%, 62% 44%, 70% 100%, 36% 100%)",
    push: [-0.1, 1],
  },
];

const N = CUTS.length;
const REST = 2.25; // px each piece sits off the whole: a seam, not a band
const LIFT = 6; // px the piece answering the selected discipline stands out

export default function FractureScene({ lift = 0 }) {
  const reduce = useReducedMotion();
  const stageRef = useRef(null);
  const nodes = useRef([]);
  const liftRef = useRef(0);
  liftRef.current = lift;

  const src = masterFor(SOURCE.id).src;

  // ---- the bodies ----
  const bodies = useRef(CUTS.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, held: false })));
  const drag = useRef(null);
  const raf = useRef(0);

  useEffect(() => {
    if (reduce) return undefined;
    const stage = stageRef.current;
    if (!stage) return undefined;
    let live = false;

    const step = () => {
      for (let i = 0; i < N; i += 1) {
        const b = bodies.current[i];
        const el = nodes.current[i];
        if (!el) continue;
        if (!b.held) {
          // the piece carries its own weight back: damped, no overshoot
          const out = REST + (i === liftRef.current ? LIFT : 0);
          const homeX = CUTS[i].push[0] * out;
          const homeY = CUTS[i].push[1] * out;
          b.vx = (b.vx + (homeX - b.x) * 0.11) * 0.78;
          b.vy = (b.vy + (homeY - b.y) * 0.11) * 0.78;
          b.x += b.vx;
          b.y += b.vy;
          if (Math.abs(b.x - homeX) < 0.2 && Math.abs(b.vx) < 0.2) {
            b.x = homeX;
            b.vx = 0;
          }
          if (Math.abs(b.y - homeY) < 0.2 && Math.abs(b.vy) < 0.2) {
            b.y = homeY;
            b.vy = 0;
          }
        }
        el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`;
      }
      raf.current = requestAnimationFrame(step);
    };

    const start = () => {
      if (!raf.current) raf.current = requestAnimationFrame(step);
    };
    const stop = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
    const io = new IntersectionObserver(
      ([e]) => {
        live = e.isIntersecting;
        if (live && !document.hidden) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(stage);
    const onVis = () => (document.hidden || !live ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce]);

  // a push, used by the pointer-free routes into the same physics
  const shove = useCallback(
    (i, dx, dy) => {
      if (reduce) return;
      const b = bodies.current[i];
      b.vx += dx;
      b.vy += dy;
    },
    [reduce]
  );

  const onDown = (e, i) => {
    if (reduce || e.button > 0) return;
    drag.current = {
      id: e.pointerId,
      i,
      x: e.clientX,
      y: e.clientY,
      ox: bodies.current[i].x,
      oy: bodies.current[i].y,
      moved: false,
      node: e.currentTarget,
      samples: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
    };
  };

  const onMove = (e) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.moved) {
      // a scroll is not a drag until the hand has clearly travelled
      if (Math.hypot(dx, dy) < 10) return;
      g.moved = true;
      g.node.setPointerCapture?.(e.pointerId);
      bodies.current[g.i].held = true;
    }
    const r = stageRef.current.getBoundingClientRect();
    const limX = r.width * 0.3;
    const limY = r.height * 0.34;
    const b = bodies.current[g.i];
    b.x = Math.max(-limX, Math.min(limX, g.ox + dx));
    b.y = Math.max(-limY, Math.min(limY, g.oy + dy));
    g.samples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (g.samples.length > 5) g.samples.shift();
  };

  const onUp = (e) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    drag.current = null;
    const b = bodies.current[g.i];
    b.held = false;
    if (!g.moved) {
      // a plain click is the pointer-light way to take a piece out:
      // one shove along its own cut, and the damping brings it back
      shove(g.i, CUTS[g.i].push[0] * 13, CUTS[g.i].push[1] * 13);
      return;
    }
    g.node.releasePointerCapture?.(e.pointerId);
    const s = g.samples;
    const a = s[0];
    const z = s[s.length - 1];
    const dt = Math.max(16, z.t - a.t);
    // released with the speed it was thrown at, then friction
    b.vx = Math.max(-38, Math.min(38, ((z.x - a.x) / dt) * 16));
    b.vy = Math.max(-38, Math.min(38, ((z.y - a.y) / dt) * 16));
  };

  // the keyboard route into the same physics, so nothing here needs a hand
  const onKey = (e, i) => {
    const K = 11;
    const d =
      { ArrowLeft: [-K, 0], ArrowRight: [K, 0], ArrowUp: [0, -K], ArrowDown: [0, K] }[e.key] || null;
    if (d) {
      e.preventDefault();
      e.stopPropagation();
      shove(i, d[0], d[1]);
    }
  };

  return (
    <div className="k-frame" ref={stageRef} data-testid="fracture-stage">
      {CUTS.map((c, i) => (
        <button
          key={c.k}
          type="button"
          ref={(n) => {
            nodes.current[i] = n;
          }}
          data-testid={`shard-${i}`}
          data-lift={i === lift ? "true" : undefined}
          className="k-shard"
          aria-label={`Piece ${i + 1} of ${N}. Move it with the arrow keys, or click to nudge it.`}
          style={{
            clipPath: c.clip,
            WebkitClipPath: c.clip,
            backgroundImage: `url(${src})`,
          }}
          onPointerDown={(e) => onDown(e, i)}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={(e) => onKey(e, i)}
        />
      ))}
    </div>
  );
}
