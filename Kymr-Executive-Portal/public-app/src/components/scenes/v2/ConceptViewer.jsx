import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Frame from "@/components/Frame";
import { masterFor, supportFor } from "@/data/media";
import { FlowButton } from "@/components/ui/flow-button";

// ============================================================
// DEEP DIVE - THE CAMPAIGN DOSSIER
//
// A modal dialog, not a lightbox. The photograph is one column of
// evidence beside the thinking; it is never the whole surface,
// because the argument of this chapter is that the studio sells
// concepts rather than frames.
//
// Dialog behaviour is implemented directly rather than through a
// library so the semantics stay explicit and auditable: role and
// aria-modal on the container, a labelled heading, Escape to
// close, a real focus trap, background scroll locked, and focus
// returned to the opener by the caller on close.
//
// Rendered through a portal to document.body. Its own chapter is a
// `.keylight` section, and that sets `isolation: isolate`, which
// creates a stacking context: a dialog rendered inside it would have
// its z-index capped below the header no matter how high the value.
// The portal lifts it out to the layer system's real overlay level.
// ============================================================
const DOSSIER = [
  { key: "audience", label: "Audience" },
  { key: "objective", label: "Campaign objective" },
  { key: "direction", label: "Visual direction" },
  { key: "motif", label: "Motif" },
  { key: "tone", label: "Tone" },
  { key: "system", label: "Campaign system" },
];

export default function ConceptViewer({ concept, index, count, onNavigate, onClose }) {
  const panelRef = useRef(null);
  const master = masterFor(concept.id);
  const support = supportFor(concept.id);

  useEffect(() => {
    const panel = panelRef.current;
    window.__lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNavigate(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNavigate(-1);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const f = panel.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])");
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    // Opening is now a route change, so the panel can mount a frame
    // after this effect runs and the immediate focus() lands on
    // nothing. Deferring a frame makes the trap reliable either way.
    const seedFocus = requestAnimationFrame(() => {
      // read the ref inside the frame: `panel` was captured before the
      // node attached, so the deferred lookup was against a stale null
      const node = panelRef.current;
      const target =
        node?.querySelector("[data-autofocus]") || node?.querySelector("button, a[href]");
      target?.focus();
    });

    return () => {
      cancelAnimationFrame(seedFocus);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
    };
  }, [onClose, onNavigate]);

  return createPortal(
    <div
      className="scrim fixed inset-0 backdrop-blur-sm"
      style={{ zIndex: 400 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
        data-testid="concept-viewer"
        className="absolute inset-0 flex flex-col"
        style={{ "--k-accent": concept.accent }}
      >
        {/* control bar stays fixed to the top of the dialog so the
            exit is reachable no matter how far the dossier is read */}
        <div className="flex flex-none items-center justify-between gap-4 border-b border-smoke bg-carbon px-gutter py-3">
          <p className="m-0 text-f-2xs text-silver-dim">
            <span style={{ color: concept.accent }}>{concept.category}</span>
            <span className="t-data pl-4">
              {String(index + 1).padStart(2, "0")} of {String(count).padStart(2, "0")}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="viewer-prev"
              aria-label="Previous concept"
              onClick={() => onNavigate(-1)}
              className="k-btn k-btn--ghost !min-h-[44px] !px-4"
            >
              <span aria-hidden="true">&larr;</span>
            </button>
            <button
              type="button"
              data-testid="viewer-next"
              aria-label="Next concept"
              onClick={() => onNavigate(1)}
              className="k-btn k-btn--ghost !min-h-[44px] !px-4"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
            {/* The two arrow buttons above stay as they are: the flow
                button draws two arrows of its own, and a third one as
                its label reads as a mistake. */}
            <FlowButton
              type="button"
              data-autofocus
              data-testid="viewer-close"
              onClick={onClose}
              text="Close"
              className="k-flow k-flow--primary !min-h-[44px]"
            />
          </div>
        </div>

        {/* Same escape hatch as the estimator dialogs. Lenis keeps its
            window wheel listener after `stop()` and preventDefaults on
            it, so without this the dossier could only be scrolled by
            dragging its scrollbar. */}
        <div data-lenis-prevent="" className="min-h-0 flex-1 overflow-y-auto px-gutter py-s6">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-s6 lg:grid-cols-12 lg:gap-s7">
            {/* ---- evidence column ---- */}
            <div className="min-w-0 lg:col-span-6">
              <Frame
                media={master}
                alt={`${concept.title}, master frame of a KymrStudio spec concept.`}
                priority
              />
              {support && (
                <Frame
                  media={support}
                  alt={`${concept.title}, supporting frame of a KymrStudio spec concept.`}
                  className="mt-3"
                />
              )}
            </div>

            {/* ---- the thinking ---- */}
            <div className="min-w-0 lg:col-span-6">
              <h2 id="dossier-title" className="t-display m-0 text-f-3xl text-frost">
                {concept.title}
              </h2>

              <p className="m-0 mt-s4 max-w-[58ch] text-f-md text-silver">{concept.premise}</p>

              <p
                className="m-0 mt-s5 max-w-[58ch] border-l-2 pl-s4 text-f-base text-frost"
                style={{ borderLeftColor: "var(--signal)" }}
              >
                <span className="t-tag block pb-1">Hook</span>
                {concept.hook}
              </p>

              <dl className="m-0 mt-s6 grid gap-s5 sm:grid-cols-2">
                {DOSSIER.map((d) => (
                  <div key={d.key}>
                    <dt className="m-0 text-f-2xs text-silver-dim">{d.label}</dt>
                    <dd className="m-0 mt-1.5 text-f-sm leading-relaxed text-frost">
                      {concept[d.key]}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-s6 border-t border-smoke pt-s4">
                <h3 className="t-tag m-0">Proposed deliverables</h3>
                <ul className="m-0 mt-s3 flex list-none flex-wrap gap-x-s5 gap-y-2 p-0">
                  {concept.deliverables.map((d) => (
                    <li key={d} className="text-f-sm text-frost">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="m-0 mt-s5 text-f-2xs text-silver-dim">
                Spec concept. Written and art-directed in-house against a self-set brief. Not a
                commissioned campaign, and no performance result is claimed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
