import { ImagesScrollingAnimation } from "@/components/ui/images-scrolling-animation";
import { SERVICES } from "@/data/services";
import { CONCEPTS } from "@/data/concepts";
import { masterFor } from "@/data/media";

// ============================================================
// CHAPTER 3 - WHAT WE MAKE
//
// Four things a brand can commission. The offerings are not asserted:
// each is a group of deliverables that already exist across the twelve
// dossiers, and data/services.js records which concepts each was read
// from.
//
// ---- THE LAYOUT ----
//
// Two columns, and the left one is sticky. The argument holds still
// beside the stack instead of scrolling away above it, which is what
// left a screen and a half of empty ground in the middle of the chapter:
// the reader finished the problems list, then travelled through nothing
// to reach the work.
//
// The left column is sticky rather than parallaxed. Those two do not
// combine - a transform on a sticky element fights its own offset - and
// holding still IS the device here.
//
// ---- THE COMPONENT, AND THE THREE EDITS IT NEEDED ----
//
// components/ui/images-scrolling-animation.tsx is the supplied file with
// three changes, all documented in its own header:
//
//   1. Its `<ReactLenis root>` wrapper is gone. App.js already runs a
//      Lenis instance for the whole site; a second `root` instance would
//      put two smooth-scroll controllers on one document.
//   2. A `projects` prop, so the cards are this studio's offerings and
//      frames rather than the five 21st.dev samples.
//   3. The card renders its own title, because here each card is an
//      offering and the chapter would otherwise name none of them.
//
// The card SIZE is not a fourth edit. The component sizes its cards with
// its own Tailwind (`lg:h-[300px] lg:w-[500px]`); the stylesheet
// overrides that from outside so the stack fills its half of the screen.
//
// Two earlier components stay in components/ui, unmounted, and are the
// owner's files: argent-loop-infinite-slider.tsx and
// connoisseur-stack-interactor.tsx.
// ============================================================

const conceptFor = (id) => CONCEPTS.find((c) => c.id === id);

// The client-facing problems. A plain list on purpose: it is the
// chapter's setup, read once, and it now sits beside something moving.
const PROBLEMS = [
  ["Repetitive ads", "New concepts and creative variations."],
  ["Production bottlenecks", "A coordinated production and editing workflow."],
  ["Disconnected teams", "One creative direction across every stage."],
  ["Wrong-format assets", "Deliverables prepared for the intended platforms."],
  ["Limited testing options", "Multiple creative versions to test and learn from."],
];

// The four offerings as sticky cards: the name, what it is, and the
// frame it is evidenced by. Frames resolve through the media manifest,
// so this cannot drift from the artwork the rest of the site shows.
const STACK_PROJECTS = SERVICES.map((sv) => ({
  title: sv.name,
  line: sv.line,
  src: masterFor(conceptFor(sv.concept).id).src,
}));

export default function MakeScene() {
  return (
    <section
      id="make"
      data-testid="make-scene"
      data-shader-mode="capabilities"
      className="env-make k-make relative"
    >
      <div className="k-make-inner">
        <div className="k-make-body">
          {/* ---- the argument, held alongside the work ---- */}
          <div className="k-make-say">
            <header className="k-make-head">
              <p className="t-data k-make-eyebrow">The problems we help you solve</p>
              <h2 className="k-make-h">Fresh creative. Clear direction. One connected team.</h2>
              <p className="k-make-sub">
                If your ads feel repetitive, production keeps slipping, or your idea gets lost
                between teams, we help bring the work together, from campaign strategy and
                concepts to production, editing and creative variations.
              </p>
              <dl className="k-make-problems" data-testid="client-problems">
                {PROBLEMS.map(([challenge, response]) => (
                  <div key={challenge} className="k-make-problem">
                    <dt className="k-make-problem-q">{challenge}</dt>
                    <dd className="k-make-problem-a">
                      <span aria-hidden="true" className="k-make-problem-arrow">
                        &rarr;
                      </span>
                      {response}
                    </dd>
                  </div>
                ))}
              </dl>
            </header>
            {/* SUPPORT_LINE ("Strategy, creative development, production,
                editing and iteration sit behind all four.") was closed
                out here at the owner's request. It restated the five
                problems directly above it in one line, so it added a
                sentence and a screen of ground without adding a claim.
                The constant is still exported from data/services.js. */}
          </div>

          {/* ---- the work, stacking as it is passed ---- */}
          <div className="dark k-make-stack">
            <ImagesScrollingAnimation projects={STACK_PROJECTS} />
          </div>
        </div>
      </div>
    </section>
  );
}
