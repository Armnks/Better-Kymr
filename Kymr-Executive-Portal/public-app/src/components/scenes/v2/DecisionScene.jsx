import { Link, useNavigate } from "react-router-dom";
import { useTransform } from "framer-motion";
import useChapterScroll from "@/hooks/useChapterScroll";
import { scrollToId } from "@/App";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, FileText, Phone } from "lucide-react";
import { goToScope, goToWebScope } from "@/lib/scope";
import { FlowButton } from "@/components/ui/flow-button";

// ============================================================
// A typographic close: the invitation leads, contact and next steps
// sit beside it, and the Cinzel signature resolves the page below.
// Campaign imagery belongs to the Archive, not behind the contact CTA.
//
// ---- MERGED INTO THE COMMISSION (2026-09-08) ----
//
// This is no longer a page-level <section>. It renders INSIDE the
// inquiry chapter, directly under the form, because the two were one
// idea split across a seam: "The commission" asks for the brief and
// this asks for the decision, and between them sat two lots of chapter
// padding and two grounds meeting for no reason.
//
// It keeps `id="decision"` and its own `data-shader-mode`, so every
// destination that named it - the /contact route, SECTION_ALIAS, the
// closing CTAs - still resolves exactly as before. What it loses is the
// section boundary, not the address.
//
// The pre-merge version is at
// audit/2026-09-08/removed/DecisionScene.before-merge.jsx.
// ============================================================
const EASE = [0.22, 1, 0.36, 1];

const EMAIL = "media@kymrstudio.com";

// The brochure's four-step engagement rail, verbatim.
const STEPS = ["Discover", "Design", "Build", "Refine"];

const PROOF = [
  { Icon: Clock, text: "A short scope, built in a few minutes" },
  { Icon: FileText, text: "A written response, not a sales deck" },
  { Icon: Phone, text: "One call only if the scope warrants it" },
];

// Privacy is back, and this time it is a real link.
//
// It shipped for a while as a dead <span> because there was no policy to
// point at, and a word styled like a link that does nothing is worse
// than no word. Both documents now exist at /privacy and /terms, so both
// are here - as internal routes, which is why they carry `to` rather
// than `href` and are rendered with <Link>.
const FOOTER_LINKS = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Instagram", href: "https://instagram.com/kymrstudio" },
  { label: "LinkedIn", href: "https://linkedin.com/company/kymrstudio" },
];

export default function DecisionScene() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  // THE CLOSE RESOLVES.
  //
  // Scrollcraft's rule is that an ending has to land rather than fade
  // into a footer, and this was the one chapter on the page with no
  // device at all: you arrived and it was simply there. The wordmark now
  // arrives with the scroll - it comes up from under the fold, settles
  // to its size, and holds. It is the last thing the page does, so it is
  // the one that has to feel finished.
  const close = useChapterScroll({ depth: 40 });
  const markRise = useTransform(close.progress, [0.15, 0.75], [64, 0]);
  const markScale = useTransform(close.progress, [0.15, 0.8], [0.9, 1]);
  const markInk = useTransform(close.progress, [0.15, 0.62], [0, 1]);

  const rise = (delay = 0) =>
    reduce
      ? { initial: false }
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <div
      ref={close.ref}
      id="decision"
      role="region"
      aria-labelledby="decision-heading"
      data-testid="decision-scene"
      data-shader-mode="contact"
      className="env-final k-close k-close--merged relative"
    >
      <div className="k-close-inner">
        {/* ---------- the decision ---------- */}
        <div className="k-close-body">
          <div className="k-close-lead">
            {/* ---- COPY FROM THE BROCHURE (owner-supplied, 2026-09-08) ----
                The brochure's third panel, "Connected by design". It
                replaces "One batch is enough to judge us." - a good line,
                but one about advertising batches, written when that was
                the only thing being sold. This one covers all three
                offerings and lands on the same CTA the brochure does. */}
            <p className="t-data k-close-eyebrow">Connected by design</p>
            <h2 id="decision-heading" className="k-close-h">
              <motion.span {...rise(0)} className="block">
                Your vision.
              </motion.span>
              <motion.span {...rise(0.06)} className="block">
                Our <span className="t-lit">expertise.</span>
              </motion.span>
            </h2>

            {/* This paragraph used to open "Tell us what you are
                producing, how often you need it..." - which is the same
                request the form directly above already makes, in almost
                the same words. Since the two blocks became one chapter
                that read as the page asking twice. The close now does
                the job its heading claims: it says what one batch is
                and what it costs to find out, and leaves the asking to
                the form. */}
            <motion.p {...rise(0.12)} className="k-close-copy">
              We design and build websites, ecommerce stores and campaigns for your business.
            </motion.p>

            {/* The brochure's engagement rail. It is NOT the pipeline in
                "One idea. Every discipline." further up the page - that
                one is how a campaign gets made, five production stages
                deep. This is how working together starts, four steps
                wide, and it is the only place the site says it. */}
            <motion.ol {...rise(0.16)} className="k-close-steps" data-testid="close-steps">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </motion.ol>

            {/* Two project routes, and they scope different work. Saying so
                under each one is the difference between a visitor choosing
                and a visitor guessing. */}
            <motion.div {...rise(0.18)} className="k-close-actions">
              <div className="k-close-act">
                {/* The page's closing action, and the last of the site's
                    buttons to become the flow button. Its own arrow span
                    is gone with it: the component draws two of its own
                    and sweeps them through the label. --lg keeps the
                    presence the solid block had, since this is the one
                    action the whole page has been walking towards. */}
                <FlowButton
                  type="button"
                  data-testid="build-plan-cta"
                  onClick={goToScope}
                  text="Start a Project"
                  className="k-flow k-flow--primary k-flow--lg"
                />
                <p className="k-close-act-note">Image and video ad campaigns.</p>
              </div>

              <div className="k-close-act">
                <button
                  type="button"
                  data-testid="make-project"
                  onClick={goToWebScope}
                  className="k-underlink k-tap"
                >
                  Make me a project
                </button>
                <p className="k-close-act-note">Websites, ecommerce and other builds.</p>
              </div>

              {/* "Book a strategy call" was the third route here, linking
                  out to cal.com. Removed at the owner's request, and the
                  CAL constant went with it - it had no other reader.
                  Booking a call is still reachable: the /start estimator
                  ends on "Book a call" once a scope exists, which is the
                  point at which a call is worth anyone's time. */}
            </motion.div>
          </div>

          {/* ---------- direct contact and what happens next ---------- */}
          <motion.div {...rise(0.1)} id="contact" className="k-direct scroll-mt-24">
            {/* The email address lives in the inquiry section, next to the
                form it is an alternative to. Repeating it here put two
                identical contact blocks within one screen of each other.
                What stays is the action and the reassurance. */}
            <p className="k-direct-label">What happens next</p>
            {/* This said "Send a project brief" and scrolled down to the
                form. The form is now in this same chapter, a few hundred
                pixels ABOVE it, so as a call to action it was pointing
                at something already on screen. What it actually does
                that nothing else does is switch that form into the
                guided brief, so that is what it now says. */}
            <button
              type="button"
              data-testid="contact-inquire"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("kymr:inquiry-mode", { detail: "project" }));
                scrollToId("inquiry");
              }}
              className="k-underlink k-direct-brief k-tap"
            >
              Answer the guided brief instead
            </button>
            <ul className="k-proof" aria-label="What happens next">
              {PROOF.map(({ Icon, text }) => (
                <li key={text}>
                  <Icon aria-hidden="true" strokeWidth={1.25} className="k-proof-icon" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* The signature is in normal flow, never behind readable copy. */}
        <motion.p
          aria-hidden="true"
          className="k-close-mark font-cinzel"
          style={reduce ? undefined : { y: markRise, scale: markScale, opacity: markInk }}
        >
          KYMRSTUDIO<span className="k-close-dot">.</span>
        </motion.p>

        {/* ---------- the footer ---------- */}
        <footer className="k-close-foot">
          <p className="m-0">&copy; 2026 KymrStudio</p>
          <nav aria-label="Footer" className="k-foot-links">
            {FOOTER_LINKS.map((l) =>
              l.to ? (
                <Link
                  key={l.label}
                  data-testid={`legal-link-${l.label.toLowerCase()}`}
                  to={l.to}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  data-testid={`social-${l.label.toLowerCase()}`}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.label}
                </a>
              )
            )}
          </nav>
        </footer>
      </div>
    </div>
  );
}
