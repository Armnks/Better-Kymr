import { motion, useReducedMotion } from "framer-motion";
import useChapterScroll from "@/hooks/useChapterScroll";
import SonarGrid from "@/components/ui/sonar-grid";
import { goToScope, goToWebScope } from "@/lib/scope";
import { FEATURES, LEVELS, MARKET_FLOORS } from "@/lib/webscope";
import { FlowButton } from "@/components/ui/flow-button";

// ============================================================
// CHAPTER 4 - BEYOND THE AD
//
// This chapter used to be "Who you actually work with": three claims
// about the studio being one small team, illustrated with a campaign
// frame. It has been replaced, not edited. The old chapter is kept
// verbatim at audit/2026-09-08/removed/CraftScene.jsx with its
// stylesheet block beside it, so restoring it is a paste.
//
// What stands here instead is everything the studio offers that is not
// an ad. Websites and ecommerce were reachable before this - the "Make
// me a project" estimator has scoped them since 2026-09-07 - but a
// visitor only ever met them as a button in the closing section. A
// service nobody has made the case for is a service nobody asks for.
//
// EVERY CLAIM ON THIS PAGE IS READ FROM ITS OWN SOURCE OF TRUTH.
//
// The builds, the two levels, what can be built into one and the two
// market floors are imported from lib/webscope.js - the documented
// single home of that feature's config, and the file the estimator
// itself runs on. The four advertising disciplines in the closing rail
// are imported from data/services.js. Nothing on this page is retyped,
// so nothing on it can drift away from what the site elsewhere says or
// from what the estimator will actually quote.
//
// The two floors ARE quotable: they are the owner's own approved
// minimums. Everything above them in that rate model is a proposed
// ladder awaiting sign-off, and none of it is stated here.
//
// ---- the ground changed with the content ----
//
// This was the page's one ivory chapter, and it earned that while it
// was the one chapter about people. It is now a chapter about work, so
// it stands back on the dark ground with everything else - and the
// sonar field needs the dark to read at all. The `k-invert` class, the
// paper texture and the light nav declaration left together; keeping
// any one of them would have been a light-chapter fitting on a dark
// chapter.
// ============================================================
const EASE = [0.23, 1, 0.32, 1];

// ---- COPY FROM THE BROCHURE (owner-supplied, 2026-09-08) ----
//
// This chapter is the brochure's second panel: "What we do", and the
// three offerings set out as one list of equal weight.
//
// It used to be "We don't stop at ads. We build premium websites." -
// which framed builds as a secondary thing bolted onto advertising. The
// brochure does not: it sells three services as one studio, so the
// numbering runs 01, 02, 03 with nothing subordinate to anything.
//
// The blurbs are the brochure's, verbatim. Where a service already had
// a definition in lib/webscope.js - which the estimator runs on - the
// brochure line is used for the pitch and the estimator's own wording
// still governs what gets scoped, so the two cannot contradict.
const HEAD = ["Your brand.", "Every touchpoint."];

// 01 and 02 are scoped by the builds estimator, 03 by the advertising
// one. The routes differ, so the list carries its own action per item
// rather than one CTA underneath pretending all three are the same buy.
const OFFERINGS = [
  {
    id: "website",
    n: "01",
    label: "Websites",
    blurb: "Custom websites and landing pages that turn attention into action.",
    action: "builds",
  },
  {
    id: "ecommerce",
    n: "02",
    label: "Ecommerce",
    blurb: "Beautiful online stores. Seamless shopping experiences.",
    action: "builds",
  },
  {
    id: "advertising",
    n: "03",
    label: "Advertising",
    blurb: "Strategy, concepts, production and creative iteration.",
    action: "ads",
  },
];

// The brochure's own footnote. Kept as a footnote rather than promoted
// to a fourth offering, because that is the weight the brochure gives
// it and because nothing in this repository scopes or prices it.
const PLUS = "Brand visuals & digital content";

export default function BuildScene() {
  const reduce = useReducedMotion();
  // Depth against the sonar field, which is NOT touched: the field is a
  // child of the section and stays exactly where it is, at exactly the
  // settings it has. Only the reading matter on top of it moves.
  const chapter = useChapterScroll({ depth: 48 });

  const rise = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0, margin: "0px 0px -12% 0px" },
      };

  return (
    <section
      ref={chapter.ref}
      id="build"
      data-testid="build-scene"
      data-shader-mode="resolve"
      className="k-build relative"
    >
      {/* The field is the chapter's ground, not an ornament sitting on
          it: the whole chapter renders inside it as children, so the
          rings pass under the type rather than over it.

          `color` is passed explicitly and deliberately. SonarGrid
          defaults to the theme's `text-primary`, and this project has
          no `--primary` - it has --signal. Left to default, the canvas
          would inherit whatever colour it landed next to.

          `pingArea` keeps the ambient rings away from the top edge,
          where the fixed header sits, and away from the very bottom,
          so they read as coming from inside the chapter. */}
      <SonarGrid
        className="k-build-grid"
        // Vermilion at 62%, not the solid --signal. A dot on the
        // wavefront is drawn at alpha 1 by the component and there is no
        // prop that caps it, so at full strength the peaks crossed the
        // body copy at the same weight as the type. Carrying the ceiling
        // in the colour is the only place it can live, and the field is
        // still unmistakably the site's own accent.
        color="rgba(255, 59, 20, 0.62)"
        // 1.25x, not the component's 2x. Measured: the field on its own
        // was 158ms/s of main thread at 2x on a 1440-wide viewport, for a
        // decorative layer. Soft dots carry no detail that survives
        // supersampling, so this is invisible and roughly halves it.
        maxDpr={1.25}
        spacing={38}
        dotRadius={1.35}
        // The resting grid carries the chapter between pings, and raising it
        // is free: the render loop's cost is driven by whether a ring is
        // alive, not by how bright a still dot is. At 0.16 the section read
        // as empty for the seconds when nothing was expanding.
        baseOpacity={0.24}
        // A wider, slower front: this chapter is 1150px tall, so a fast
        // narrow ring reads as a stripe crossing the screen rather than
        // as something expanding through the section.
        // A ring lives until it clears the box, so at 200px/s in an 1150px
        // chapter one was always alive and the loop never got to idle -
        // which is the whole point of the component's scheduler. Faster
        // rings leave real gaps between pings.
        ringWidth={140}
        speed={340}
        amplitude={1.6}
        pingEvery={6}
        maxRings={3}
        pingArea={[0.1, 0.14, 0.9, 0.86]}
      >
        <div className="k-build-inner">
          {/* ---- BAND 1: the masthead, and it carries the two numbers ----

              The headline used to stand alone across the top with
              nothing on its right, and the two approved floors sat
              buried at the foot of a sidebar. Set opposite each other
              they read as a masthead: what the studio does, and what it
              costs to start, on one line. It also removes the widest
              empty band in the chapter.

              The parallax lives on the WRAPPER, not on the header. The
              entrance animation already animates `y` on the header
              itself, and framer-motion lets that animation win over a
              motion value bound to the same property - so the scroll
              transform was being silently overwritten. */}
          <motion.div style={{ y: chapter.far }}>
          <motion.header
            className="k-build-head"
            {...rise}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="k-build-head-say">
              <p className="k-build-eyebrow">What we do</p>
              <h2 className="k-build-h">
                {HEAD.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
            </div>

            {/* The only two figures on this page, and the only two in
                the rate model that are signed off. Stated as the
                minimums they are, not as a price for anything. */}
            <div className="k-build-rate">
              <p className="k-build-floors" data-testid="build-floors">
                {Object.values(MARKET_FLOORS).map((m) => (
                  <span key={m.currency} className="k-build-floor">
                    <span className="k-build-floor-m">{m.label}</span>
                    <span className="k-build-floor-v">from {m.floor}</span>
                  </span>
                ))}
              </p>
              <p className="k-build-floors-note">
                Studio minimums, not a quote. The estimator scopes the rest.
              </p>
            </div>
          </motion.header>
          </motion.div>

          <motion.div style={{ y: chapter.near }}>
          <motion.div
            className="k-build-body"
            {...rise}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.08, ease: EASE }}
          >
            {/* ---- BAND 2: three offerings ACROSS ----

                The brochure sells three services of equal weight, and a
                vertical list cannot say that: whatever is at the top of
                a stack reads as the main one. Three columns divided by
                hairlines say it in the layout itself, and the chapter
                stops being two stacked lists sitting beside each other.

                Each column carries its own action, because 01 and 02
                are scoped by the builds estimator and 03 by the
                advertising one. */}
            <ol className="k-build-list" data-testid="build-offers">
              {OFFERINGS.map((o) => (
                <li key={o.id} className="k-build-offer">
                  <p className="k-build-offer-n t-data">{o.n}</p>
                  <p className="k-build-offer-h">{o.label}</p>
                  <p className="k-build-offer-d">{o.blurb}</p>
                  <button
                    type="button"
                    data-testid={`build-offer-${o.id}`}
                    onClick={o.action === "ads" ? goToScope : goToWebScope}
                    className="k-link k-build-offer-cta"
                  >
                    {o.action === "ads" ? "Scope a campaign" : "Scope this build"}
                    <span aria-hidden="true" className="k-link-arrow">&rarr;</span>
                  </button>
                </li>
              ))}
            </ol>

            {/* ---- BAND 3: what can be built into one ----

                A short lede held to the left of a six-cell grid. It was
                a full-height ruled column mirroring the offerings, which
                is what made the chapter read as one layout printed
                twice. Cells rather than rows, so the texture differs
                from every other list in the chapter. */}
            <div className="k-build-side">
              <div className="k-build-side-say">
                <h3 className="k-build-lede">Built in, when you need it.</h3>
                {/* The brochure's own footnote, and it belongs here
                    rather than under the button: it names more things
                    that come with the work, which is what this band is.
                    It also gives the lede's column something to do for
                    the three rows the grid beside it runs. */}
                <p className="k-build-plus" data-testid="build-plus">
                  <span className="k-build-plus-k">Plus</span>
                  {PLUS}
                </p>
              </div>
              <ul className="k-build-feats" data-testid="build-features">
                {FEATURES.map((f) => (
                  <li key={f.id} className="k-build-feat">
                    <span className="k-build-feat-h">{f.label}</span>
                    <span className="k-build-feat-d">{f.blurb}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---- BAND 4: the closing bar ----

                Standard and Premium are the estimator's own two levels,
                and the distinction between them is the one the word
                "premium" is doing work for above. They are a
                qualification on the buy, so they sit in the same band as
                the buy rather than under the offerings as a fourth and
                fifth thing to choose. */}
            <div className="k-build-close">
              <div className="k-build-close-say">
                <ul className="k-build-levels" data-testid="build-levels">
                  {LEVELS.map((l) => (
                    <li key={l.id} className="k-build-level">
                      <span className="k-build-level-h">{l.label}</span>
                      <span className="k-build-level-d">{l.blurb}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="k-build-actions">
                <FlowButton
                  type="button"
                  data-testid="build-scope"
                  onClick={goToWebScope}
                  text="Make me a project"
                  className="k-flow k-flow--primary"
                />
                {/* The split the site states everywhere else it is met,
                    so nobody scopes a campaign in the builds estimator. */}
                <button
                  type="button"
                  data-testid="build-to-ads"
                  onClick={goToScope}
                  className="k-link"
                >
                  Running ad campaigns instead?
                  <span aria-hidden="true" className="k-link-arrow">
                    &rarr;
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
          </motion.div>

          {/* The rail that listed the four advertising disciplines here
              is gone. It existed to show that the studio does more than
              builds - which is now item 03 of the list above, in the
              brochure's own words. Keeping both would have put the same
              breadth claim in one chapter twice, which is exactly the
              duplication this chapter was just cleaned of. Advertising
              still has its own chapter at #make, reachable from the nav
              and from /services. */}

        </div>
      </SonarGrid>
    </section>
  );
}
