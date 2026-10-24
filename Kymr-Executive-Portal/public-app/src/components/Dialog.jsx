import { useCallback, useEffect, useRef } from "react";

// ============================================================
// DIALOG SHELL
//
// One implementation of the behaviour every estimator dialog needs, so
// the focus trap and the scroll lock exist once rather than once per
// dialog and drift apart.
//
//   focus moves in on open, and is trapped in both directions
//   Escape and the close button dismiss, and RETURN focus to the trigger
//   a caller can opt out of that return (`onAdvance`) when the visitor
//     has deliberately asked to continue somewhere else
//   background scroll is stopped through the page's own Lenis instance,
//     not a competing lock, and the position is restored on close
//   and the dialog's OWN scrolling still works, which needs saying
//     explicitly - see `data-lenis-prevent` below
//
// No outside-click dismissal: these dialogs hold configuration a visitor
// has entered, and a stray click on the backdrop should not discard it.
// ============================================================
const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Dialog({ open, onClose, labelledBy, describedBy, className, children }) {
  const ref = useRef(null);
  const restoreTo = useRef(null);
  const scrollY = useRef(0);

  const dismiss = useCallback(() => {
    onClose();
    const t = restoreTo.current;
    if (t && typeof t.focus === "function") window.setTimeout(() => t.focus(), 0);
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    restoreTo.current = document.activeElement;
    scrollY.current = window.scrollY;

    if (window.__lenis) window.__lenis.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = ref.current;
    (node?.querySelector(FOCUSABLE) || node)?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      if (window.__lenis) {
        window.__lenis.start();
        // Through Lenis, for the same reason as everywhere else on this
        // site: a bare window.scrollTo is overwritten on the next frame
        // by Lenis's own scroll target.
        window.__lenis.scrollTo(scrollY.current, { immediate: true, force: true });
      } else {
        window.scrollTo(0, scrollY.current);
      }
    };
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div className="k-web-backdrop" data-testid="dialog-backdrop">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        // THE DIALOG HAS TO OPT OUT OF LENIS BY NAME.
        //
        // Lenis attaches ONE wheel listener to the window and calls
        // preventDefault on it. `lenis.stop()` above stops the page
        // animating, but it does NOT detach that listener - so a wheel
        // over an open dialog was cancelled before the browser could
        // scroll the panel, and the only way to move the content was to
        // grab the scrollbar with the mouse.
        //
        // `data-lenis-prevent` is Lenis's own escape hatch: it walks up
        // from the event target and leaves the event alone if it finds
        // this attribute. It sits on the dialog root so it covers both
        // shapes we have - the advertising estimator, which scrolls on
        // this element itself, and the builds estimator, which scrolls
        // on `.k-web-body` inside it.
        data-lenis-prevent=""
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={className}
        data-testid={className?.includes("k-web") ? "web-estimator" : "scope-estimator"}
      >
        {typeof children === "function" ? children({ dismiss }) : children}
      </div>
    </div>
  );
}
