import { useCallback, useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import Frame from "@/components/Frame";
import { CONCEPTS } from "@/data/concepts";
import { masterFor } from "@/data/media";

// ============================================================
// THE ARCHIVE ORBIT
//
// Twelve concepts suspended on a shallow cylinder inside one
// chamber. The camera moves around them; they do not slide past a
// window. One plane owns the front, its neighbours turn toward it
// and fall back in depth, and everything beyond the second neighbour
// is off the stage entirely - invisible, unclickable, untabbable.
//
// Position is one continuous motion value, `pos`, in concept units.
// Every input writes to it and nothing else:
//
//   autoplay / buttons / clicks   tween to the next whole number
//   a drag                        writes it directly, 1:1 with the hand
//   a throw                       hands its velocity to a spring
//
// Because they all share one value, a throw can be caught mid-flight,
// reversed, and thrown again without any of them knowing about each
// other. The lateral placement is deliberately linear for the first
// step either side of the front, which is what makes a drag track the
// pointer exactly rather than approximately.
//
// React state is never written during a gesture. Each plane derives
// its own transform from `pos` through useTransform, so a drag moves
// twelve transforms and re-renders nothing.
// ============================================================
const N = CONCEPTS.length;
const STEP = 400; // px of lateral travel for the first step either side

// The orbit, sampled at whole steps out from the front and
// interpolated between. Depth, turn, fall and light all read off the
// same curve, so a plane cannot be in two hierarchies at once.
const SEATS = {
  x: [0, STEP, STEP * 1.72, STEP * 2.2],
  z: [140, -170, -400, -560],
  rotateY: [0, 31, 51, 60],
  y: [0, 20, 36, 46],
  scale: [1, 0.81, 0.64, 0.52],
  opacity: [1, 0.75, 0.48, 0.18],
};

const CAMERA = { duration: 0.9, ease: [0.23, 1, 0.32, 1] };
// Autoplay is a drift, not a slideshow: the camera never stops, so
// there is no dwell, no cut and no moment where the orbit is waiting.
const SECONDS_PER_CONCEPT = 5;
const LAP = { duration: SECONDS_PER_CONCEPT * N, ease: "linear" };
const THROW = { type: "spring", duration: 0.5, bounce: 0.2 };
const SETTLE = { type: "spring", duration: 0.4, bounce: 0 };

const mod = (n) => ((n % N) + N) % N;
/** Shortest signed way around the ring, so 12 to 01 is one step. */
const shortest = (from, to) => {
  const d = mod(to - from);
  return d > N / 2 ? d - N : d;
};

/** Piecewise-linear read of a seat curve at a fractional distance. */
function at(ad, curve) {
  const i = Math.min(curve.length - 2, Math.floor(ad));
  const t = Math.min(1, Math.max(0, ad - i));
  return curve[i] + (curve[i + 1] - curve[i]) * t;
}

export default function ArchiveOrbit({
  active,
  command,
  reduce,
  drifting,
  onCommit,
  onSelect,
  onGrab,
  onRelease,
}) {
  const pos = useMotionValue(active);
  const grabY = useMotionValue(0);
  const grabTilt = useMotionValue(0);
  const stageRef = useRef(null);
  const target = useRef(active);
  const dragging = useRef(false);
  const grabbed = useRef(-1);
  const running = useRef(null);
  // A throw passes through concepts on its way to the one it is
  // aimed at, and each of those commits the metadata. Without this
  // the resulting `active` change would be read as a fresh camera
  // move and would yank the throw back to wherever it had got to.
  const settling = useRef(false);
  const drift = useRef(false);

  // ---- the one way the orbit is ever moved ----
  const travel = useCallback(
    (idx, opts) => {
      const from = pos.get();
      const to = from + shortest(from, idx);
      target.current = mod(Math.round(to));
      running.current?.stop();
      running.current = animate(pos, to, opts);
      return running.current;
    },
    [pos]
  );

  // ---- the drift ----
  //
  // One lap of the ring at a constant rate, chained end to end, so the
  // orbit is always turning. It is deliberately NOT a slideshow: there
  // is no dwell on the front plane and no moment where the ring waits.
  //
  // `lap` is hoisted out of the effect because a camera move needs to
  // hand motion back to it on landing. `live` is the only gate: while
  // it is set the chain re-arms itself, so nothing short of autoplay
  // being switched off, reduced motion, or a hand on a plane can leave
  // the orbit at rest.
  const live = useRef(false);

  const lap = useCallback(
    function run() {
      if (!live.current || dragging.current) return;
      // taking the wheel back from a throw also retires it, or its
      // onComplete would never fire and settling would latch on.
      settling.current = false;
      drift.current = true;
      const to = pos.get() + N;
      target.current = mod(Math.round(to));
      running.current?.stop();
      running.current = animate(pos, to, { ...LAP, onComplete: run });
    },
    [pos]
  );

  // A command is a move the visitor asked for: a step button, a click
  // on a neighbouring plane, a dossier route. Autoplay is NOT a command
  // and never arrives here, which is what lets a command interrupt the
  // drift without the drift's own passing indices interrupting it back.
  //
  // The drift is picked up again the moment the camera lands, so the
  // orbit is never left standing still by a control the visitor used.
  const seen = useRef(command.seq);
  useEffect(() => {
    if (command.seq === seen.current) return;
    seen.current = command.seq;
    if (dragging.current || settling.current) return;
    drift.current = false;
    travel(command.i, reduce ? { duration: 0 } : { ...CAMERA, onComplete: lap });
  }, [command, travel, reduce, lap]);

  useEffect(() => {
    if (!drifting || reduce) {
      live.current = false;
      if (drift.current) {
        drift.current = false;
        running.current?.stop();
        // settle on the concept it was passing rather than freezing
        // between two of them
        const rest = Math.round(pos.get());
        target.current = mod(rest);
        running.current = animate(pos, rest, SETTLE);
      }
      return undefined;
    }
    live.current = true;
    lap();
    // The lap has to be stopped here, not merely orphaned: an effect
    // that re-runs would otherwise leave the previous lap driving the
    // same value, and two laps turn the orbit at twice the rate.
    return () => {
      live.current = false;
      running.current?.stop();
    };
  }, [drifting, reduce, pos, lap]);

  // The committed concept changes when the incoming plane takes the
  // front, not when the gesture starts: metadata follows dominance.
  useEffect(() => {
    let last = mod(Math.round(pos.get()));
    return pos.on("change", (v) => {
      const now = mod(Math.round(v));
      if (now === last) return;
      last = now;
      onCommit?.(now);
    });
  }, [pos, onCommit]);

  useEffect(() => () => running.current?.stop(), []);

  // ---- grab, drag, throw ----
  //
  // Pointer capture keeps the gesture on the plane it started on even
  // when the hand leaves it. Displacement is converted to concept
  // units through the same STEP the seats are built from, which is
  // what makes the plane sit under the finger rather than near it.
  const gesture = useRef(null);

  const onPointerDown = useCallback(
    (e) => {
      if (reduce || e.button > 0) return;
      // A press anywhere on the stage catches the orbit. Restricting
      // the grab to the perfectly centred plane meant a throw could
      // not be caught mid-flight, because mid-flight nothing is
      // perfectly centred. Capture is deliberately NOT taken here: a
      // captured pointer delivers its click to the capturing element,
      // which would swallow every neighbour selection. It is taken
      // once the gesture is actually a drag.
      running.current?.stop();
      settling.current = false;
      drift.current = false;
      gesture.current = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        pos0: pos.get(),
        moved: false,
        samples: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
      };
    },
    [pos, reduce]
  );

  const onPointerMove = useCallback(
    (e) => {
      const g = gesture.current;
      if (!g || g.id !== e.pointerId) return;
      const dx = e.clientX - g.x0;
      const dy = e.clientY - g.y0;
      if (!g.moved) {
        // hysteresis: a press that never travels stays a press
        if (Math.hypot(dx, dy) < 10) return;
        g.moved = true;
        dragging.current = true;
        grabbed.current = mod(Math.round(g.pos0));
        g.captured = e.currentTarget;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onGrab?.();
      }
      g.samples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (g.samples.length > 6) g.samples.shift();

      pos.set(g.pos0 - dx / STEP);
      // a little vertical freedom, resisted the further it is taken
      const vy = dy * 0.55;
      grabY.set((vy * 120) / (120 + Math.abs(vy) * 0.7));
      grabTilt.set(Math.max(-7, Math.min(7, -dx * 0.012)));
    },
    [pos, grabY, grabTilt, onGrab]
  );

  const endGesture = useCallback(
    (e) => {
      const g = gesture.current;
      if (!g || g.id !== e.pointerId) return;
      gesture.current = null;
      if (g.captured) {
        try {
          g.captured.releasePointerCapture?.(e.pointerId);
        } catch {
          /* the pointer is already gone */
        }
      }
      if (!g.moved) return; // a press, not a drag: the click stands

      const s = g.samples;
      const a = s[0];
      const b = s[s.length - 1];
      const dt = Math.max(16, b.t - a.t);
      const vx = ((b.x - a.x) / dt) * 1000; // px per second
      const vIdx = -vx / STEP;

      // Momentum projection: where the flick would come to rest under
      // a 0.99 deceleration, snapped to the nearest concept and capped
      // so a hard throw can never lose the visitor.
      const RATE = 0.99;
      const projected = pos.get() + (vIdx / 1000) * (RATE / (1 - RATE));
      const from = Math.round(g.pos0);
      const landed = Math.round(projected);
      const capped = Math.max(from - 3, Math.min(from + 3, landed));
      const thrown = Math.abs(vIdx) > 0.9;

      target.current = mod(capped);
      running.current?.stop();
      settling.current = true;
      running.current = animate(pos, capped, {
        ...(thrown ? THROW : SETTLE),
        velocity: vIdx,
        onComplete: () => {
          settling.current = false;
        },
      });
      animate(grabY, 0, SETTLE);
      animate(grabTilt, 0, SETTLE);

      dragging.current = false;
      grabbed.current = -1;
      onRelease?.(mod(capped), g.moved);
    },
    [pos, grabY, grabTilt, onRelease]
  );

  return (
    <div
      ref={stageRef}
      data-testid="archive-orbit"
      className="k-orbit"
      // The whole stage is the handle. Mid-flight nothing is centred
      // and the gaps between planes are as much a part of the orbit as
      // the planes are, so a press anywhere in the chamber catches it.
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
      style={{ perspective: reduce ? "none" : "1400px", perspectiveOrigin: "50% 44%" }}
    >
      <div className="k-orbit-rig">
        {CONCEPTS.map((c, i) => (
          <Plane
            key={c.id}
            i={i}
            concept={c}
            pos={pos}
            grabY={grabY}
            grabTilt={grabTilt}
            grabbedRef={grabbed}
            active={active}
            reduce={reduce}
            onSelect={onSelect}
            gestureRef={gesture}
          />
        ))}
      </div>
    </div>
  );
}

function Plane({
  i,
  concept,
  pos,
  grabY,
  grabTilt,
  grabbedRef,
  active,
  reduce,
  onSelect,
  gestureRef,
}) {
  const d = shortest(active, i);
  const onStage = Math.abs(d) <= 2;
  const front = d === 0;

  // One transform string per plane, recomputed off `pos` without a
  // render. `--lean` is written by the ember; keeping it in the string
  // means the two systems compose instead of fighting for the node.
  const transform = useTransform([pos, grabY, grabTilt], ([p, gy, gt]) => {
    let dd = i - p;
    dd = mod(dd + N / 2) - N / 2;
    const ad = Math.abs(dd);
    const sign = dd < 0 ? -1 : 1;
    const held = grabbedRef.current === i;
    const x = sign * at(ad, SEATS.x);
    const y = at(ad, SEATS.y) + (held ? gy : 0);
    const z = at(ad, SEATS.z);
    const rot = -sign * at(ad, SEATS.rotateY);
    const s = at(ad, SEATS.scale);
    const tilt = held ? gt : 0;
    return `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg) rotateZ(calc(${tilt.toFixed(2)}deg + var(--lean, 0deg))) scale(${s.toFixed(3)})`;
  });

  const opacity = useTransform(pos, (p) => {
    let dd = i - p;
    dd = mod(dd + N / 2) - N / 2;
    return at(Math.min(3, Math.abs(dd)), SEATS.opacity);
  });

  const zIndex = useTransform(pos, (p) => {
    let dd = i - p;
    dd = mod(dd + N / 2) - N / 2;
    return 40 - Math.round(Math.abs(dd) * 10);
  });

  return (
    <motion.button
      type="button"
      data-testid={`gallery-plane-${i}`}
      data-card={i}
      data-front={front ? "true" : undefined}
      aria-label={`${concept.title}, ${concept.category}, concept ${i + 1} of ${N}`}
      aria-current={front ? "true" : undefined}
      aria-hidden={onStage ? undefined : "true"}
      // Roving tabindex: only the plane holding the front is a tab stop.
      // Every on-stage plane used to be one, which on a 390px viewport
      // meant tabbing into a plane sitting entirely off the side of the
      // screen - the orbit is far wider than a phone, so a neighbour is
      // visible on a desktop and simply not there on a handset. The
      // arrow keys still move between all twelve, which is what the
      // instruction above the orbit already tells a keyboard visitor,
      // and a pointer can still click any neighbour it can see.
      tabIndex={front ? 0 : -1}
      onClick={(e) => {
        // a recognised drag swallows the click it ends on
        if (gestureRef.current?.moved) {
          e.preventDefault();
          return;
        }
        if (!front) onSelect?.(i);
      }}
      className="k-plane"
      style={{
        transform,
        opacity,
        zIndex,
        pointerEvents: onStage ? "auto" : "none",
        cursor: front && !reduce ? "grab" : "pointer",
      }}
    >
      <span className="k-plane-light" aria-hidden="true" />
      <Frame
        media={masterFor(concept.id)}
        alt=""
        priority={Math.abs(d) <= 1}
        // Measured, not guessed. The front plane renders at roughly
        // 49vw on a phone, 36vw on a tablet and 16vw on a desktop; the
        // neighbours are smaller again. A flat 30vw over-declared the
        // desktop case by nearly double, which with a real srcset now
        // costs a rung of resolution nobody can see.
        sizes="(max-width: 640px) 50vw, (max-width: 1023px) 38vw, 18vw"
        ratioClass="aspect-[3/4]"
        className="k-plane-frame"
        style={{ "--k-accent": concept.accent }}
      />
      {/* Number and title only.
          Every plane used to repeat a "Spec concept" label under it, so the
          phrase appeared twelve times in one chapter and the receding
          miniatures overlapped each other's captions. The status is stated
          once in the chapter's own standfirst and once on the forward
          concept in the dock, which is where a visitor reads it. */}
      <span className="k-plane-name" aria-hidden="true">
        <span className="t-data k-plane-n">{String(i + 1).padStart(2, "0")}</span>
        <span className="k-plane-title">{concept.title}</span>
      </span>
    </motion.button>
  );
}
