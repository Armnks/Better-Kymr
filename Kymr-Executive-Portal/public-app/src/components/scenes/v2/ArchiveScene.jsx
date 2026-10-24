import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import useChapterScroll from "@/hooks/useChapterScroll";
import ArchiveOrbit from "@/components/archive/ArchiveOrbit";
import ConceptViewer from "@/components/scenes/v2/ConceptViewer";
import { useNavigate, useParams } from "react-router-dom";
import { CONCEPTS, conceptBySlug, slugFor } from "@/data/concepts";
import { FlowButton } from "@/components/ui/flow-button";

// ============================================================
// CHAPTER 2 - SELECTED WORK
//
// One chamber, one viewport, three layers: an editorial header that
// frames the work instead of competing with it, the orbit itself,
// and a single dock holding everything the visitor needs to know and
// everything they can do about it. The dock used to be three
// unrelated objects below the fold. It is now one object, on screen,
// beside the work it describes.
//
// The work leads the page, so it sits directly under the hero and
// the first thing a visitor sees after the promise is a campaign.
//
// The orbit turns endlessly. Nothing incidental stops it: a pointer
// resting on the work, a cursor crossing it, keyboard focus landing
// inside it and a step button being pressed all leave it turning, and
// a step hands motion straight back to the drift as the camera lands.
// Only two things take the wheel, and both are the visitor physically
// holding the work still: a hand dragging a plane, and an open dossier
// covering it. The Pause control remains the one deliberate way to
// stop it, and reduced motion switches autoplay off entirely and
// leaves every manual route working.
//
// The chapter captures no vertical input and pins nothing: the page
// scrolls past it at any point, without waiting for twelve concepts.
// ============================================================
const EASE = [0.23, 1, 0.32, 1];


const N = CONCEPTS.length;
const mod = (n) => ((n % N) + N) % N;

// The visitor pressing Pause is a decision about how they want the site
// to behave, so it outlives the page. Absent means autoplay; "off" means
// they turned it off. Only the control writes here: holding a plane or
// opening a dossier are transient and must not be mistaken for a
// preference.
const AUTOPLAY_KEY = "kymr-archive-autoplay";

const readAutoplay = () => {
  try {
    return window.localStorage.getItem(AUTOPLAY_KEY) !== "off";
  } catch {
    return true;
  }
};

const writeAutoplay = (on) => {
  try {
    if (on) window.localStorage.removeItem(AUTOPLAY_KEY);
    else window.localStorage.setItem(AUTOPLAY_KEY, "off");
  } catch {
    /* a browser refusing storage must not break the control */
  }
};

export default function ArchiveScene() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  // The heading drifts against the orbit as the chapter passes, so the
  // two read as being at different distances. THE ORBIT ITSELF IS NOT
  // TOUCHED - it keeps turning at its own rate, continuously.
  //
  // It is handed the section ref this component already owns, because a
  // second `ref` on the same element is silently dropped.
  const chapter = useChapterScroll({ ref: sectionRef, depth: 54 });

  // The chamber settles as the chapter is crossed.
  //
  // Scrollcraft's rule is that every act earns its span, and this one did
  // not: the orbit turned on its own timer and scrolling past it changed
  // nothing. Now the chamber tips a few degrees and comes level as the
  // chapter passes, so the scroll is doing something here rather than
  // just carrying the reader over a thing that happens to be moving.
  // Transform only - the orbit's own rotation is untouched.
  const chamberTilt = useTransform(chapter.progress, [0, 0.5, 1], [7.5, 0, -7.5]);
  const chamberLift = useTransform(chapter.progress, [0, 0.5, 1], [0.965, 1, 0.965]);
  const chamberRef = useRef(null);
  const openerRef = useRef(null);

  const navigate = useNavigate();
  const { conceptSlug } = useParams();

  // The URL owns which dossier is open, so deep links, refresh, Back
  // and Forward all work without a second source of truth.
  const routed = conceptSlug ? conceptBySlug(conceptSlug) : null;
  const notFound = Boolean(conceptSlug) && !routed;

  const [active, setActive] = useState(() =>
    routed ? CONCEPTS.findIndex((c) => c.id === routed.id) : 0
  );
  const dossier = Boolean(routed);
  const [announce, setAnnounce] = useState("");

  // ---- the conditions the rotation lives under ----
  const [handling, setHandling] = useState(false); // a plane is held
  const [playing, setPlaying] = useState(readAutoplay); // the visitor's own choice, remembered

  // What the orbit is told to do, as opposed to where it currently is.
  // `active` changes many times a second while the ring drifts past
  // twelve concepts; a command is only ever a move the visitor asked
  // for, so the orbit can act on one without the other yanking it back.
  const activeRef = useRef(active);
  activeRef.current = active;
  const [command, setCommand] = useState(() => ({ i: active, seq: 0 }));
  const issue = useCallback((i) => setCommand((c) => ({ i: mod(i), seq: c.seq + 1 })), []);

  const acc = useRef(0);
  const settle = useRef(null);
  const locked = useRef(false);
  const manual = useRef(false);

  useEffect(() => {
    if (!routed) return;
    const i = CONCEPTS.findIndex((x) => x.id === routed.id);
    if (i >= 0) {
      setActive(i);
      issue(i);
    }
  }, [routed, issue]);

  const c = CONCEPTS[active];

  // Every index change is functional, because a held arrow key, a fast
  // double click and an autoplay tick can land in the same frame and a
  // stale read would skip or stall.
  const step = useCallback(
    (dir, source) => {
      const n = mod(activeRef.current + dir);
      setActive(n);
      if (source !== "auto") {
        manual.current = true;
        issue(n);
      }
    },
    [issue]
  );

  const goTo = useCallback(
    (i, source) => {
      const n = mod(i);
      setActive(n);
      if (source !== "auto") {
        manual.current = true;
        issue(n);
      }
    },
    [issue]
  );

  // A move the visitor asked for is announced once it lands. The
  // rotation is not: it would talk over the page every five seconds.
  useEffect(() => {
    if (!manual.current) return;
    manual.current = false;
    setAnnounce(`${CONCEPTS[active].title}, ${active + 1} of ${N}`);
  }, [active]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  // The rotation stops only for a hand actually holding a plane or a
  // dossier covering the work. Hovering and focus are deliberately not
  // in here: they are proximity, not intent, and stopping for them is
  // what made the chapter feel like it kept catching.
  const interacting = handling || dossier;
  void interacting;

  // ...and it stops when the chapter is off screen.
  //
  // The lap drives twelve planes through a transform, an opacity and a
  // z-index EVERY FRAME. Left ungated that ran for the entire life of the
  // page, including while the visitor was reading a section thousands of
  // pixels away, which is a permanent tax on every other animation and
  // on scrolling itself. An endless carousel nobody can see does not need
  // to turn: it resumes the moment the chapter comes back into view, so
  // it is still always moving whenever anyone is looking at it.
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // THE ORBIT DOES NOT STOP.
  //
  // It used to hold still for a hand dragging a plane and for an open
  // dossier. Both are gone at the owner's instruction (2026-09-08): the
  // archive is meant to be continuously in motion, and a carousel that
  // catches every time you touch it reads as broken rather than as
  // considerate.
  //
  // What is left is not an exception a visitor can perceive:
  //   reduce    prefers-reduced-motion. Not negotiable, and not a stop
  //             a visitor did not ask for - they asked for it in their OS.
  //   onScreen  the chapter is not in the viewport. Nobody is looking at
  //             it, and twelve planes writing a transform, an opacity and
  //             a z-index every frame for the life of the page is the
  //             single most expensive thing this page has ever done.
  //   playing   the visitor pressed Pause. WCAG 2.2.2 requires a way to
  //             stop motion that starts on its own and runs past five
  //             seconds, so this control stays. It defaults to playing.
  const drifting = playing && !reduce && onScreen;

  // the hero action lands focus on the work itself
  useEffect(() => {
    const onOpen = () => {
      sectionRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      window.setTimeout(
        () => chamberRef.current?.querySelector('[aria-current="true"]')?.focus(),
        reduce ? 60 : 900
      );
    };
    window.addEventListener("kymr:open-archive", onOpen);
    return () => window.removeEventListener("kymr:open-archive", onOpen);
  }, [reduce]);

  // ---- horizontal intent only: the page keeps its own scrolling ----
  useEffect(() => {
    if (reduce) return undefined;
    const el = chamberRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (dossier) return;
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (locked.current) return;
      if (Math.sign(e.deltaX) !== Math.sign(acc.current)) acc.current = 0;
      acc.current += e.deltaX;
      window.clearTimeout(settle.current);
      settle.current = window.setTimeout(() => {
        acc.current = 0;
      }, 200);
      if (Math.abs(acc.current) < 90) return;
      acc.current = 0;
      locked.current = true;
      window.setTimeout(() => {
        locked.current = false;
      }, 520);
      step(e.deltaX > 0 ? 1 : -1, "manual");
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settle.current);
    };
  }, [reduce, dossier, step]);

  const onKeyDown = (e) => {
    if (dossier) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      step(1, "manual");
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      step(-1, "manual");
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0, "manual");
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(N - 1, "manual");
    }
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      data-testid="archive-scene"
      data-shader-mode="archive"
      className="env-archive relative"
    >
      <div className="k-archive">
        {/* ---------- editorial header ---------- */}
        <motion.header className="k-archive-head" style={{ y: chapter.far }}>
          <h2 className="k-archive-h">
            Selected <span className="t-lit">work.</span>
          </h2>
          <p className="k-archive-lead">Campaign concepts by KymrStudio.</p>
          <p className="k-archive-note">
            Twelve self-initiated spec concepts: briefs written in-house, then answered in full.
            None of them ran as commissioned campaigns, and no client result is claimed.
          </p>
        </motion.header>

        {/* ---------- the orbit ---------- */}
        <motion.div
          ref={chamberRef}
          style={reduce ? undefined : { rotateX: chamberTilt, scale: chamberLift }}
          role="group"
          aria-roledescription="carousel"
          aria-label="Archive of twelve spec concepts"
          data-testid="archive-chamber"
          onKeyDown={onKeyDown}
          className="k-chamber"
        >
          <p className="sr-only">Use the arrow keys to move between concepts.</p>
          <ArchiveOrbit
            active={active}
            command={command}
            reduce={reduce}
            drifting={drifting}
            onCommit={(i) => setActive((prev) => (prev === i ? prev : i))}
            onSelect={(i) => goTo(i, "manual")}
            onGrab={() => setHandling(true)}
            onRelease={() => setHandling(false)}
          />
        </motion.div>

        {/* ---------- the dock ---------- */}
        <div className="k-dock">
          <motion.div
            key={c.id}
            className="k-dock-read"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: reduce ? 0 : 0.24, ease: EASE }}
          >
            <p className="k-dock-meta">
              <span style={{ color: c.accent }}>{c.category}</span>
              <span className="t-data">
                {String(active + 1).padStart(2, "0")} / {N}
              </span>
              <span className="k-dock-spec">Spec concept</span>
            </p>
            <h3 className="k-dock-title">{c.title}</h3>
            <p className="k-dock-premise">{c.premise}</p>
            {/* The brief belongs WITH the description, not after the whole
                chapter. It used to be a sibling of .k-archive, so it never
                inherited the chapter's gutter (left edge 0 against the
                title's 52) and it sat flush on the section boundary with
                0px beneath it. Inside the dock's reading column it aligns
                with the title and description for free, and the chapter's
                own bottom padding gives it room. */}
            <p className="k-archive-brief">
              <span className="t-data k-archive-brief-k">The brief:</span> {c.motif}
            </p>
          </motion.div>

          <div className="k-dock-controls">
            <FlowButton
              type="button"
              ref={openerRef}
              data-testid="archive-open"
              onClick={() => navigate(`/work/${slugFor(c)}`)}
              text="Explore the concept"
              className="k-flow k-flow--primary"
            />

            {/* the transport: step, and the visitor's own play control */}
            <div className="k-transport">
              <button
                type="button"
                data-testid="archive-prev"
                aria-label="Previous concept"
                onClick={() => step(-1, "manual")}
                className="k-tbtn"
              >
                <span aria-hidden="true">&larr;</span>
              </button>
              <button
                type="button"
                data-testid="archive-play"
                data-on={playing ? "true" : undefined}
                aria-pressed={playing}
                onClick={() =>
                  setPlaying((v) => {
                    writeAutoplay(!v);
                    return !v;
                  })
                }
                className="k-tbtn k-tbtn--wide"
              >
                {reduce ? "Autoplay off" : playing ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                data-testid="archive-next"
                aria-label="Next concept"
                onClick={() => step(1, "manual")}
                className="k-tbtn"
              >
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>

            {/* progress: position, without a live region announcing it */}
            <p className="k-progress t-data" aria-hidden="true">
              <span className="k-progress-track">
                <span
                  className="k-progress-fill"
                  style={{ transform: `scaleX(${(active + 1) / N})` }}
                />
              </span>
              <span className="k-progress-n">
                {String(active + 1).padStart(2, "0")} / {N}
              </span>
            </p>
          </div>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>

      {notFound && (
        <div
          role="alert"
          data-testid="concept-not-found"
          className="relative mx-auto mt-s5 w-full max-w-[1600px] border border-smoke px-s5 py-s4"
          style={{ zIndex: "var(--z-content)" }}
        >
          <p className="m-0 text-f-sm text-frost">
            That concept does not exist. Twelve are listed below.
          </p>
          <button type="button" onClick={() => navigate("/work")} className="k-link mt-s3">
            Back to the archive
            <span aria-hidden="true" className="k-link-arrow">
              &rarr;
            </span>
          </button>
        </div>
      )}

      {dossier && (
        <ConceptViewer
          concept={c}
          index={active}
          count={N}
          onNavigate={(d) => {
            const next = mod(active + d);
            navigate(`/work/${slugFor(CONCEPTS[next])}`, { replace: true });
          }}
          onClose={() => {
            navigate("/work", { replace: false });
            window.setTimeout(() => openerRef.current?.focus(), 60);
          }}
        />
      )}
    </section>
  );
}
