import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CONCEPTS } from "@/data/concepts";
import { masterFor } from "@/data/media";
import { FlowButton } from "@/components/ui/flow-button";

// ============================================================
// CHAPTER 5 - THE SIGNAL ASSEMBLY
//
// One idea travelling through five production stations. The stage is
// a track: the station the visitor is at holds the centre of the
// frame at full strength, its neighbours sit at the edges dimmed, and
// the whole assembly slides as the scroll moves. The signal orb holds
// the centre, so the work passes through it rather than the other way
// round.
//
// Every station is built from real material: the archive's own frames
// and the concepts' own categories, titles and audiences. Nothing
// here is a placeholder panel, and nothing is generated.
//
//   1 DISCOVER   a brief, a category, an audience, one product frame
//   2 DEFINE     the same material aligned on one angle
//   3 CREATE     the angle unfolded into story frames
//   4 PRODUCE    one idea cut into the formats it has to run in
//   5 LEARN      outputs, what came back, and the return to Discover
//
// Scroll drives one value. React state changes five times in the
// chapter, at the station boundaries, never per frame.
// ============================================================
const EASE = [0.23, 1, 0.32, 1];

const PHASES = [
  {
    key: "discover",
    name: "Discover",
    need: "The product, the audience and the commercial goal",
    does: "Interrogate the category and the platform the work has to survive",
    receive: "A shared read on what the work has to beat",
    carries: "The problem, stated in one line",
  },
  {
    key: "define",
    name: "Define",
    need: "Constraints, brand rules and anything that failed before",
    does: "Set positioning, messaging angles and creative direction",
    receive: "An agreed angle, before anything is produced",
    carries: "The angle",
  },
  {
    key: "create",
    name: "Create",
    need: "One round of direction on the angle",
    does: "Develop concepts, scripts, storyboards and the campaign system",
    receive: "Work designed for the platforms it will run on",
    carries: "The concept and its world",
  },
  {
    key: "produce",
    name: "Produce",
    need: "Product, access and sign-off windows",
    does: "Capture and edit the complete variation-ready asset bank",
    receive: "Every ratio, cutdown and hook variant the system calls for",
    carries: "The asset bank",
  },
  {
    key: "learn",
    name: "Learn and Iterate",
    need: "What the numbers did",
    does: "Review creative performance and rewrite the next brief from it",
    receive: "The next round, already argued",
    carries: "Back to Discover",
  },
];

const TERMS = [
  { n: "100%", l: "asset review, at every phase" },
  { n: "48H", l: "batch turnaround" },
  { n: "3s", l: "hook window" },
  { n: "10+", l: "iterations per sprint" },
];

// the concept this chapter follows through the system
const LEAD = CONCEPTS[4]; // One Clean Signal, Technology
const STORY = [CONCEPTS[4], CONCEPTS[1], CONCEPTS[9]];
const OUTPUTS = [CONCEPTS[4], CONCEPTS[1], CONCEPTS[9], CONCEPTS[7]];
const FORMATS = ["9:16", "4:5", "1:1", "16:9"];

const N = PHASES.length;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function OperatingSystemScene() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const orbRef = useRef(null);

  const [act, setAct] = useState(0);
  const actRef = useRef(0);
  const centre = useRef(0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // Scroll writes the track position straight to the DOM. The only
  // thing that reaches React is the station index.
  useEffect(() => {
    if (reduce) return undefined;
    return scrollYProgress.on("change", (v) => {
      // Eased station to station rather than clamped: a clamp left the
      // first and last tenth of the section with the track parked,
      // which is scroll that does nothing. This settles into each
      // station without ever standing still.
      const t = clamp(v, 0, 1) * (N - 1);
      const i = Math.min(N - 2, Math.floor(t));
      const f = t - i;
      const c = i + f * f * f * (f * (f * 6 - 15) + 10);
      centre.current = c;
      trackRef.current?.style.setProperty("--centre", c.toFixed(4));
      const next = clamp(Math.round(c), 0, N - 1);
      if (next === actRef.current) return;
      actRef.current = next;
      setAct(next);
    });
  }, [scrollYProgress, reduce]);

  const goToStation = useCallback((i) => {
    const el = wrapRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / N);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  // ---- the signal ----
  //
  // It holds the centre of the frame so the assembly passes through
  // it. A hand can take it a short way off that mark; friction and a
  // spring bring it back, and the scroll never notices.
  const orb = useRef({ x: 0, y: 0, vx: 0, vy: 0, held: false });
  const drag = useRef(null);
  const raf = useRef(0);

  useEffect(() => {
    if (reduce) return undefined;
    const stage = stageRef.current;
    const node = orbRef.current;
    if (!stage || !node) return undefined;

    let live = false;
    const pointer = { x: -9999, y: -9999 };

    const step = () => {
      const o = orb.current;
      if (!o.held) {
        // a short pointer lean, then home
        const r = stage.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const d = Math.hypot(dx, dy);
        const lean = d < 220 ? (1 - d / 220) * 9 : 0;
        const tx = d < 220 ? (dx / (d || 1)) * lean : 0;
        const ty = d < 220 ? (dy / (d || 1)) * lean : 0;
        o.vx = (o.vx + (tx - o.x) * 0.14) * 0.82;
        o.vy = (o.vy + (ty - o.y) * 0.14) * 0.82;
        o.x += o.vx;
        o.y += o.vy;
      }
      node.style.transform = `translate3d(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
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
    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    document.addEventListener("visibilitychange", onVis);
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce]);

  const onDown = (e) => {
    if (reduce || e.button > 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: orb.current.x, oy: orb.current.y };
    orb.current.held = true;
  };
  const onMoveOrb = (e) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    // a short leash: the signal can be taken off its mark, not away
    const R = 90;
    let x = g.ox + (e.clientX - g.x);
    let y = g.oy + (e.clientY - g.y);
    const d = Math.hypot(x, y);
    if (d > R) {
      const k = (R + (d - R) * 0.28) / d;
      x *= k;
      y *= k;
    }
    orb.current.x = x;
    orb.current.y = y;
  };
  const onUpOrb = (e) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    drag.current = null;
    orb.current.held = false;
    orb.current.vx = 0;
    orb.current.vy = 0;
  };

  const phase = PHASES[act];

  const stationState = (i) => {
    const d = Math.abs(i - act);
    if (d === 0) return { opacity: 1, scale: 1, filter: "blur(0px)" };
    if (d === 1) return { opacity: 0.45, scale: 0.93, filter: "blur(1.2px)" };
    return { opacity: 0.2, scale: 0.88, filter: "blur(2.4px)" };
  };

  if (reduce) return <StillProcess navigate={navigate} />;

  return (
    <section
      id="process"
      data-testid="operating-system-scene"
      data-shader-mode="process"
      className="env-process k-proc relative"
    >
      <div ref={wrapRef} className="relative h-[166svh]">
        <div
          data-testid="process-chamber"
          data-act={act}
          className="k-proc-stage sticky top-0 flex h-[100svh] flex-col overflow-hidden px-gutter"
        >
          {/* ---------- head ---------- */}
          <header className="k-proc-head">
            <h2 className="t-display m-0 text-[clamp(1.5rem,2.6vw,2.25rem)] text-frost">
              How a project actually <span className="t-lit">moves.</span>
            </h2>
            <ol className="k-proc-nav" data-testid="stage-index">
              {PHASES.map((ph, i) => (
                <li key={ph.key}>
                  <button
                    type="button"
                    data-testid={`stage-${i}`}
                    data-on={i === act ? "true" : undefined}
                    aria-current={i === act ? "true" : undefined}
                    onClick={() => goToStation(i)}
                    className="k-proc-step"
                  >
                    <span aria-hidden="true" className="k-proc-mark" />
                    {ph.name}
                  </button>
                </li>
              ))}
            </ol>
          </header>

          {/* ---------- the assembly ---------- */}
          <div ref={stageRef} className="k-assembly">
            <div ref={trackRef} className="k-track">
              {PHASES.map((ph, i) => (
                <motion.div
                  key={ph.key}
                  className="k-station"
                  data-station={ph.key}
                  aria-hidden={i === act ? undefined : "true"}
                  animate={stationState(i)}
                  transition={{ duration: 0.66, ease: EASE }}
                >
                  <Station index={i} />
                </motion.div>
              ))}
            </div>

            {/* the signal, holding the centre of the frame */}
            <span aria-hidden="true" className="k-orb-light" />
            <button
              ref={orbRef}
              type="button"
              data-testid="process-ember"
              aria-label="The project signal, travelling through the production system."
              onPointerDown={onDown}
              onPointerMove={onMoveOrb}
              onPointerUp={onUpOrb}
              onPointerCancel={onUpOrb}
              className="k-orb"
            >
              <span className="k-orb-core" />
            </button>
          </div>

          {/* ---------- the live stage ---------- */}
          <motion.div
            key={phase.key}
            className="k-proc-read"
            initial={{ opacity: 0, y: 8, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <h3 className="k-proc-stage-name">{phase.name}</h3>
            <dl className="k-proc-facts">
              <div>
                <dt>You bring</dt>
                <dd>{phase.need}</dd>
              </div>
              <div>
                <dt>We do</dt>
                <dd>{phase.does}</dd>
              </div>
              <div>
                <dt className="k-proc-key">You receive</dt>
                <dd className="k-proc-val">{phase.receive}</dd>
              </div>
              <div>
                <dt>Carries forward</dt>
                <dd className="k-proc-val">{phase.carries}</dd>
              </div>
            </dl>
          </motion.div>

          {/* ---------- the rail ---------- */}
          <div className="k-proc-rail">
            <p className="k-proc-terms">
              {TERMS.map((t) => (
                <span key={t.n}>
                  <span className="t-display k-proc-n">{t.n}</span>
                  {t.l}
                </span>
              ))}
            </p>
            <FlowButton
              type="button"
              data-testid="process-start"
              onClick={() => navigate("/start")}
              text="Start a Project"
              className="k-flow k-flow--primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One station: the material the stage actually works on.
 *
 * Every station is a three column grid with the work in the middle
 * cell, because the signal holds the centre of the frame: composing
 * this way puts the orb on the picture at every stage and never on
 * something that has to be read.
 */
function Station({ index }) {
  if (index === 0) {
    return (
      <div className="k-st">
        <div className="k-cell k-cell--l">
          <p className="k-st-tag">{LEAD.category}</p>
          <p className="k-st-line">{LEAD.title}</p>
          <p className="k-st-body">{LEAD.audience}</p>
        </div>
        <div className="k-cell k-cell--c">
          <figure className="k-frame k-frame--lead">
            <img src={masterFor(LEAD.id).src} alt="" loading="lazy" draggable={false} />
          </figure>
        </div>
        <div className="k-cell k-cell--r" />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="k-st">
        <div className="k-cell k-cell--l" />
        <div className="k-cell k-cell--c">
          <figure className="k-frame k-frame--tall">
            <img src={masterFor(LEAD.id).src} alt="" loading="lazy" draggable={false} />
          </figure>
        </div>
        <div className="k-cell k-cell--r">
          <p className="k-st-tag">The angle</p>
          <p className="k-st-angle">{LEAD.hook}</p>
          <p className="k-st-body">{LEAD.direction}</p>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="k-st">
        <div className="k-cell k-cell--l k-cell--frame">
          <figure className="k-frame k-frame--story" style={{ "--n": 0 }}>
            <img src={masterFor(STORY[1].id).src} alt="" loading="lazy" draggable={false} />
            <figcaption>{STORY[1].title}</figcaption>
          </figure>
        </div>
        <div className="k-cell k-cell--c">
          <figure className="k-frame k-frame--story" style={{ "--n": 1 }}>
            <img src={masterFor(STORY[0].id).src} alt="" loading="lazy" draggable={false} />
            <figcaption>{STORY[0].title}</figcaption>
          </figure>
        </div>
        <div className="k-cell k-cell--r k-cell--frame">
          <figure className="k-frame k-frame--story" style={{ "--n": 2 }}>
            <img src={masterFor(STORY[2].id).src} alt="" loading="lazy" draggable={false} />
            <figcaption>{STORY[2].title}</figcaption>
          </figure>
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="k-st">
        <div className="k-cell k-cell--l k-cell--frame">
          <figure className="k-frame k-frame--cut" style={{ "--n": 0 }}>
            <img src={masterFor(OUTPUTS[1].id).src} alt="" loading="lazy" draggable={false} />
            <figcaption className="t-data">{FORMATS[0]}</figcaption>
          </figure>
        </div>
        <div className="k-cell k-cell--c">
          <figure className="k-frame k-frame--lead">
            <img src={masterFor(OUTPUTS[0].id).src} alt="" loading="lazy" draggable={false} />
            <figcaption className="t-data">{FORMATS[1]}</figcaption>
          </figure>
        </div>
        <div className="k-cell k-cell--r k-cell--frame k-cell--pair">
          {[2, 3].map((k) => (
            <figure key={OUTPUTS[k].id} className="k-frame k-frame--cut" style={{ "--n": k }}>
              <img src={masterFor(OUTPUTS[k].id).src} alt="" loading="lazy" draggable={false} />
              <figcaption className="t-data">{FORMATS[k]}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="k-st">
      <div className="k-cell k-cell--l k-cell--frame k-cell--pair">
        {[1, 2].map((k) => (
          <figure key={OUTPUTS[k].id} className="k-frame k-frame--out" style={{ "--n": k }}>
            <img src={masterFor(OUTPUTS[k].id).src} alt="" loading="lazy" draggable={false} />
          </figure>
        ))}
      </div>
      <div className="k-cell k-cell--c">
        <figure className="k-frame k-frame--lead">
          <img src={masterFor(OUTPUTS[0].id).src} alt="" loading="lazy" draggable={false} />
        </figure>
      </div>
      <div className="k-cell k-cell--r">
        <p className="k-st-tag">What came back</p>
        <p className="k-st-line">{PHASES[4].receive}</p>
        <p className="k-st-body">The learning becomes the next brief, and the round starts again at Discover.</p>
      </div>
    </div>
  );
}

/** Reduced motion: the five stations as an editorial sequence. */
function StillProcess({ navigate }) {
  return (
    <section
      id="process"
      data-testid="operating-system-scene"
      data-shader-mode="process"
      className="env-process k-proc relative px-gutter pb-s8 pt-[calc(var(--k-section)+1.5rem)]"
    >
      <div className="relative mx-auto w-full max-w-[1600px]" style={{ zIndex: "var(--z-content)" }}>
        <h2 className="t-display m-0 text-[clamp(1.5rem,2.6vw,2.25rem)] text-frost">
          How a project actually <span className="t-lit">moves.</span>
        </h2>
        <ol className="m-0 mt-s6 grid list-none gap-s6 p-0 lg:grid-cols-2">
          {PHASES.map((ph, i) => (
            <li key={ph.key} className="flex gap-s5">
              <figure className="k-frame k-frame--still">
                <img src={masterFor(OUTPUTS[i % OUTPUTS.length].id).src} alt="" loading="lazy" />
              </figure>
              <div className="min-w-0">
                <h3 className="k-proc-stage-name">{ph.name}</h3>
                <dl className="k-proc-facts k-proc-facts--stack">
                  <div>
                    <dt>You bring</dt>
                    <dd>{ph.need}</dd>
                  </div>
                  <div>
                    <dt>We do</dt>
                    <dd>{ph.does}</dd>
                  </div>
                  <div>
                    <dt className="k-proc-key">You receive</dt>
                    <dd className="k-proc-val">{ph.receive}</dd>
                  </div>
                  <div>
                    <dt>Carries forward</dt>
                    <dd className="k-proc-val">{ph.carries}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
        <div className="k-proc-rail mt-s7">
          <p className="k-proc-terms">
            {TERMS.map((t) => (
              <span key={t.n}>
                <span className="t-display k-proc-n">{t.n}</span>
                {t.l}
              </span>
            ))}
          </p>
          <FlowButton
            type="button"
            data-testid="process-start"
            onClick={() => navigate("/start")}
            text="Start a Project"
            className="k-flow k-flow--primary"
          />
        </div>
      </div>
    </section>
  );
}
