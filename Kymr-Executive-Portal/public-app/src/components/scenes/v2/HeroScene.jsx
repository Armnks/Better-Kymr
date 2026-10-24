import { motion, useReducedMotion } from "framer-motion";
import useChapterScroll from "@/hooks/useChapterScroll";
import { useNavigate } from "react-router-dom";
import { scrollToId } from "@/App";
import ShaderAnimation from "@/components/ui/shader-lines";
import { goToScope } from "@/lib/scope";
import { FlowButton } from "@/components/ui/flow-button";

// ============================================================
// CHAPTER 1 - THE SIGNAL
//
// Background untouched: the shader field, the procedural horizon and
// the faded wordmark are exactly as they were.
//
// The foreground was the problem. It was a single stacked column
// floating in the middle of an enormous frame, ignoring the horizon
// entirely and leaving three quarters of the canvas empty.
//
// It now sits on the horizon. The wordmark and the field own the
// upper frame as the subject; the argument is anchored along the
// lower edge, reading left to right across the full width: the
// statement, then how it works, then the way in. Type is scaled to
// the frame rather than to a 40rem column.
// ============================================================
const EASE = [0.22, 1, 0.36, 1];

// The studio's own operating commitments, already recorded in this
// repository. Nothing here is invented and no client result is claimed.
const COMMITMENTS = [
  { n: "48H", l: "batch turnaround" },
  { n: "10+", l: "iterations per sprint" },
];

// ---- COPY FROM THE BROCHURE (owner-supplied, 2026-09-08) ----
//
// The hero used to lead on advertising alone - "Ads people watch." -
// which was true when advertising was the only thing being sold. The
// brochure positions the studio as three offerings of equal weight, and
// the site now says the same thing in the same words.
//
// The discipline line replaces the old standfirst rather than sitting
// under it: the brochure states the three services as the subhead, so a
// paragraph re-listing them underneath would be the third time a visitor
// read the same list before scrolling once.
const DISCIPLINES = ["Strategy", "Design", "Technology"];

export default function HeroScene({ ready = true }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // Depth on the way out. The wordmark leaves faster than the argument,
  // so the hero has layers rather than being one flat plate that slides.
  // THE FIELD IS NOT TOUCHED - it is not inside either wrapper, and the
  // hero looks exactly as it did until you scroll.
  const hero = useChapterScroll({ mode: "leaving", depth: 70 });

  const rise = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 22 },
          animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
          transition: { duration: 0.75, delay, ease: EASE },
        };

  return (
    <section
      ref={hero.ref}
      id="top"
      data-testid="hero-scene"
      data-shader-mode="hero"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden px-gutter pb-[9vh] pt-24"
    >
      {/* The landing field, now absolutely positioned inside the hero
          instead of fixed to the page. Identical at rest; the
          difference is that it leaves with the hero rather than
          sitting behind every chapter below. */}
      <ShaderAnimation className="pointer-events-none" />

      {/* the mark as part of the world: the horizon paints across its
          lower half, which puts it behind the atmosphere rather than
          on top of it */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 select-none whitespace-nowrap font-cinzel font-bold text-frost"
        style={{
          top: "24%",
          x: "-50%",
          y: hero.far,
          fontSize: "clamp(4rem, 15.5vw, 17rem)",
          lineHeight: 0.82,
          letterSpacing: "-0.02em",
          zIndex: 1,
        }}
        initial={reduce ? false : { opacity: 0, scale: 1.05 }}
        animate={ready ? { opacity: 0.13, scale: 1 } : { opacity: 0 }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        KymrStudio
      </motion.span>

      {/* Grade along the lower edge, where the argument now sits, plus a
          light lean from the left. The field stays fully visible through
          the upper two thirds. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 2,
          background:
            "linear-gradient(180deg, transparent 38%, rgba(11,11,14,0.55) 62%, rgba(11,11,14,0.93) 88%)," +
            "linear-gradient(100deg, rgba(11,11,14,0.9) 0%, rgba(11,11,14,0.5) 26%, transparent 52%)",
        }}
      />

      <motion.div
        className="relative mx-auto w-full max-w-[1600px]"
        style={{ zIndex: "var(--z-content)", y: hero.near, opacity: hero.fade }}
      >
        {/* the statement, scaled to the frame */}
        <h1 className="m-0">
          <motion.span
            {...rise(0)}
            className="t-display block text-[clamp(2.8rem,6.6vw,6.2rem)] text-frost"
          >
            Built to stand out.
          </motion.span>
          <motion.span
            {...rise(0.04)}
            className="t-display block text-[clamp(2.8rem,6.6vw,6.2rem)] text-frost"
          >
            Designed to grow.
          </motion.span>
          <motion.span
            {...rise(0.1)}
            className="t-display mt-3 block text-[clamp(1.5rem,3vw,2.75rem)] text-silver"
          >
            Websites. Ecommerce. Advertising.
          </motion.span>
        </h1>

        {/* one lit rule along the horizon, carrying the argument across */}
        <motion.div
          aria-hidden="true"
          className="mt-s6 h-px w-full origin-left"
          style={{ background: "linear-gradient(90deg, var(--signal), var(--smoke) 34%, transparent)" }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={ready ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
        />

        {/* the lower band reads across the full width instead of stacking
            in a narrow column */}
        <div className="mt-s5 flex flex-wrap items-end justify-between gap-x-s9 gap-y-s5">
          {/* The brochure's hero panel carries no paragraph: the subhead
              "Websites. Ecommerce. Advertising." is the supporting line,
              and a sentence under it re-listing the same three services
              was the third time a visitor read them before scrolling
              once. The close says what the studio does in a sentence;
              the hero says it in three words. */}

          <motion.div {...rise(0.24)} className="flex flex-wrap items-center gap-6">
            <FlowButton
              type="button"
              data-testid="hero-start"
              onClick={goToScope}
              text="Start a Project"
              className="k-flow k-flow--primary"
            />
            <button
              type="button"
              data-testid="hero-view-work"
              onClick={() => navigate("/work")}
              className="k-link"
            >
              Explore the Archive
              <span aria-hidden="true" className="k-link-arrow">&rarr;</span>
            </button>
          </motion.div>

          {/* The brochure's foot line. It is a statement of practice, not a
              claim, which is why it sits as data rather than as copy. */}
          <motion.p
            {...rise(0.28)}
            className="t-data m-0 hidden text-f-2xs tracking-[0.28em] text-silver-dim lg:block"
          >
            {DISCIPLINES.join("  /  ")}
          </motion.p>

          {/* two real commitments, held at the far edge so the wide frame
              resolves instead of trailing off into empty ground */}
          <motion.dl
            {...rise(0.32)}
            className="m-0 hidden items-baseline gap-s7 xl:flex"
          >
            {COMMITMENTS.map((c) => (
              <div key={c.n} className="flex items-baseline gap-2.5">
                <dt className="t-display m-0 text-f-lg text-signal">{c.n}</dt>
                <dd className="m-0 text-f-2xs text-silver">{c.l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>
    </section>
  );
}
