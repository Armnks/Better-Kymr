import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Frame from "@/components/Frame";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { capabilityMedia } from "@/data/media";
import { STAGES, STAGE_COUNT as N, SUBJECT } from "@/data/capabilities";

// ============================================================
// CHAPTER — ONE IDEA. EVERY DISCIPLINE.
//
// One campaign followed through five stages. This is deliberately NOT
// new machinery: it is the same reel MakeScene already uses — a reel
// several viewports deep, a stage pinned inside it, and the scroll
// position deciding which stage is forward, with the plates stacked and
// cross-faded on the scrub rather than swapped on a click.
//
// What is new is what the plates hold. Until now the site had exactly one
// photograph per concept and nothing else, so a section about process had
// nothing to show but the finished frame. It now shows the note, the
// storyboard, the set, the cut and the variants.
//
// An asset that does not exist is OMITTED, never substituted. capabilityMedia()
// returns null for an undelivered slot and the plate simply does not render;
// a photograph standing in for a pencil storyboard would misrepresent what
// this studio actually has.
//
// Same fallbacks as the other reel, for the same reasons:
//   reduced motion    no reel, no pin — the rail selects on click
//   under 1024px      one column; a pin cannot hold a rail and a plate
//   under 720px tall  the content does not fit a pinned stage
// ============================================================
const EASE = [0.23, 1, 0.32, 1];
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export default function CapabilitiesScene() {
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px) and (min-height: 720px)");

  // THE REEL IS BACK ON, at the owner's instruction (2026-09-08).
  //
  // It was switched off on 2026-09-06 with this reasoning, which is worth
  // keeping rather than deleting, because it is the cost of the decision
  // and it has not stopped being true: five pinned viewport-deep bands
  // mean every visitor scrolls the whole sequence whether or not they
  // want the detail, and it cannot be opted out of.
  //
  // What is different now is that the rail is a real control inside the
  // pin, so a visitor who wants stage five can click straight to it
  // instead of scrolling four bands to reach it. That was the actual
  // complaint - no way out of the sequence - and it now has one.
  //
  // The three fallbacks are unchanged and still load-bearing:
  //   reduced motion    no reel, no pin - the rail selects on click
  //   under 1024px      one column; a pin cannot hold a rail and a plate
  //   under 720px tall  the content does not fit a pinned stage
  const cinematic = wide && !reduce;

  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  const reelRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: reelRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!cinematic) return;
    const i = clamp(Math.floor(p * N), 0, N - 1);
    setActive((prev) => (prev === i ? prev : i));
  });

  useEffect(() => {
    if (!cinematic) setActive(0);
  }, [cinematic]);

  const select = useCallback(
    (i, focus = false) => {
      const n = ((i % N) + N) % N;
      if (focus) tabs.current[n]?.focus();
      const el = reelRef.current;
      if (!cinematic || !el) {
        setActive(n);
        return;
      }
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = Math.max(1, el.offsetHeight - window.innerHeight);
      const y = top + ((n + 0.5) / N) * span;
      // Through Lenis, never window.scrollTo: the page's scroll position is
      // driven from Lenis's own rAF target, so a native smooth scroll is
      // overwritten on the next frame and the rail silently does nothing.
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.1 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    },
    [cinematic]
  );

  const onKey = (e) => {
    const from = tabs.current.indexOf(document.activeElement);
    const at = from === -1 ? active : from;
    const map = {
      ArrowRight: at + 1, ArrowDown: at + 1,
      ArrowLeft: at - 1, ArrowUp: at - 1,
      Home: 0, End: N - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    select(map[e.key], true);
  };

  const stage = STAGES[active];

  // The rail lives INSIDE the pinned stage. Above it, it scrolled out of
  // view the moment the reel took over, which left a visitor five
  // viewports deep with no indication of which stage they were in or how
  // many were left. The reference board keeps it on screen throughout.
  const rail = (
    <div role="tablist" aria-label="Pipeline stages" className="k-cap-rail" onKeyDown={onKey}>
      {STAGES.map((s, i) => (
        <button
          key={s.key}
          type="button"
          role="tab"
          id={`cap-tab-${s.key}`}
          aria-selected={i === active}
          aria-controls="cap-panel"
          tabIndex={i === active ? 0 : -1}
          data-testid={`cap-stage-${i}`}
          data-on={i === active ? "true" : undefined}
          ref={(n) => {
            tabs.current[i] = n;
          }}
          onClick={() => select(i)}
          className="k-cap-tab"
        >
          <span aria-hidden="true" className="t-data k-cap-tab-n">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="k-cap-tab-name">{s.name}</span>
        </button>
      ))}
    </div>
  );

  const body = (
    <div className="k-cap-pinned">
      {rail}
      <div className="k-cap-body">
      {/* ---- the reading column ----
          Keyed on the stage, so the copy dips and rises with the plate
          instead of hard-cutting under it. The plates already leave
          before the next arrives; without this the words swapped in a
          single frame while the picture beside them took 400ms, and the
          two halves of the same stage change read as two events. */}
      <motion.div
        key={stage.key}
        className="k-cap-read"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: EASE }}
      >
        {/* The "01 /" that sat here is gone. It repeated the number the
            rail above already shows, and a section-number label above a
            heading is the most recognisable AI-design tell there is. The
            rail carries position; the panel carries the stage. */}
        <h3 className="k-cap-stage">{stage.name}</h3>
        <p className="k-cap-line">{stage.line}</p>
        <p className="k-cap-para">{stage.body}</p>
        <p className="k-cap-note">{stage.note}</p>

        {stage.deliverables && (
          <div className="k-cap-deliv">
            <p className="t-data k-cap-deliv-h">Deliverables</p>
            <ul>
              {stage.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* ---- the plates ---- */}
      <div className="k-cap-plate" id="cap-panel" role="tabpanel" aria-labelledby={`cap-tab-${stage.key}`}>
        <div className="k-cap-deck">
          {STAGES.map((s, i) => (
            <Plate key={s.key} i={i} stage={s} progress={scrollYProgress} cinematic={cinematic} active={active} />
          ))}
        </div>
        <motion.p
          key={stage.key}
          className="k-cap-cap"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: EASE }}
        >
          <span className="t-data k-cap-cap-cat" style={{ color: SUBJECT.accent }}>
            {SUBJECT.category}
          </span>
          <span className="k-cap-cap-t">{SUBJECT.title}</span>
          <span className="k-cap-cap-note">{stage.caption}</span>
        </motion.p>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="capabilities"
      data-testid="capabilities-scene"
      data-shader-mode="capabilities"
      className="env-cap k-cap relative"
    >
      <div className="k-cap-inner">
        <header className="k-cap-head">
          <h2 className="k-cap-h">
            One idea. Every discipline.
          </h2>
          <p className="k-cap-sub">
            Follow one in-house concept from the first decision to the final cut.
          </p>
        </header>

        {/* The reel is the scroll track and the pin is the stage held
            inside it. Both classes already existed in the stylesheet;
            what was missing was the markup to hang them on - and
            `reelRef`, which useScroll measures, was attached to nothing
            at all, so the progress value driving every plate transform
            was reading an empty ref.

            Off the reel - reduced motion, narrow, or short - the stage
            renders exactly as it did, with the rail as its control. */}
        {cinematic ? (
          <div ref={reelRef} className="k-cap-reel">
            <div className="k-cap-stage-pin">{body}</div>
          </div>
        ) : (
          body
        )}
      </div>
    </section>
  );
}

// One stage's plate. A stage with a five-frame cut renders the strip;
// everything else renders its single asset. A stage whose asset has not
// been delivered renders nothing at all rather than borrowing another's.
function Plate({ i, stage, progress, cinematic, active }) {
  const band = 1 / N;
  const start = i * band;
  const end = (i + 1) * band;
  // A DIP, not a dissolve - and this is the opposite of what the offerings
  // reel does, on purpose.
  //
  // There, five crops of ONE campaign overlap, because a gap between two
  // frames of the same shot reads as a hole. Here the plates are different
  // OBJECTS - a note, a storyboard, a lit set, a cut - and two of them are
  // cutouts with real alpha. Crossfading those showed the set straight
  // THROUGH the storyboard's paper: a double exposure at every boundary,
  // and giving the plates an opaque backing could not fix it, because at
  // the midpoint both layers are half-transparent and neither occludes.
  //
  // So the outgoing plate leaves before the incoming one arrives, and the
  // chapter's own ground shows for an instant between them.
  const w = 0.2 * band;
  const first = i === 0;
  const last = i === N - 1;

  const opacity = useTransform(
    progress,
    [
      first ? -0.6 : start,       // arrives only once the previous has gone
      first ? -0.5 : start + w,
      last ? 1.5 : end - w,       // and leaves before the next arrives
      last ? 1.6 : end,
    ],
    [0, 1, 1, 0]
  );
  const scale = useTransform(progress, [start, end], [1.045, 1]);
  const y = useTransform(progress, [start, end], [8, -8]);

  const media = capabilityMedia(stage.slot);
  const strip = (stage.strip || []).map(capabilityMedia).filter(Boolean);

  const style = cinematic
    ? { opacity, scale, y }
    : { opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" };

  return (
    <motion.div
      className="k-cap-cel"
      data-strip={strip.length ? "true" : undefined}
      aria-hidden={i === active ? undefined : "true"}
      style={style}
    >
      {media && (
        <Frame
          media={media}
          alt={`${SUBJECT.title}, ${stage.name.toLowerCase()} stage`}
          sizes="(max-width: 1023px) 100vw, 46vw"
          className="k-cap-img"
        />
      )}
      {strip.length > 0 && (
        <ol className="k-cap-strip" data-testid="cap-strip">
          {strip.map((m, k) => (
            <li key={m.name}>
              <Frame
                media={m}
                alt={`${SUBJECT.title}, frame ${k + 1} of ${strip.length}`}
                ratio="16 / 9"
                sizes="9vw"
              />
            </li>
          ))}
        </ol>
      )}
    </motion.div>
  );
}
