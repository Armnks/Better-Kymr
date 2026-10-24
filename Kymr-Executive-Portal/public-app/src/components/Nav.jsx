import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scrollToId } from "@/App";
import { goToScope } from "@/lib/scope";
import { FlowButton } from "@/components/ui/flow-button";

// The page is theme-locked to the stage, so the header no longer
// has to read the ground underneath it and flip between a light
// and a dark treatment. What is left is a single dark bar that
// gains a backdrop once the hero is behind it.
//
// Destinations and their section ids are unchanged.
const LINKS = [
  { id: "work", label: "Work", to: "/work" },
  { id: "make", label: "Services", to: "/services" },
  { id: "build", label: "Websites", to: "/websites" },
  { id: "inquiry", label: "Contact", to: "/inquiry" },
];

const MENU_LINKS = [
  ...LINKS,
  { id: "decision", label: "Start a Project", to: "/contact" },
];

export default function Nav() {
  const navigate = useNavigate();
  const barRef = useRef(null);
  const menuBtnRef = useRef(null);
  const panelRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  // Capabilities inverts to a mineral surface, so the header has to
  // invert with it or the wordmark and the action go white on white.
  const [light, setLight] = useState(false);

  // Scroll progress is written straight to a transform via rAF, so
  // the bar never causes a React render while scrolling.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      setLifted(window.scrollY > 24);
      // whichever section owns the header's own midline decides the theme
      let onLight = false;
      for (const el of document.querySelectorAll("[data-nav-theme]")) {
        const r = el.getBoundingClientRect();
        if (r.top <= 34 && r.bottom > 34) onLight = el.dataset.navTheme === "light";
      }
      setLight(onLight);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    window.__lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const triggerEl = menuBtnRef.current;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll("button, a[href]");
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector("button, a[href]")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
      triggerEl?.focus();
    };
  }, [menuOpen]);

  const go = (id, to) => {
    setMenuOpen(false);
    if (to && window.location.pathname !== to) {
      navigate(to);
      return;
    }
    // The close effect restarts Lenis, but it has not flushed inside
    // this handler yet, so start it explicitly or the scroll below
    // is silently dropped.
    window.__lenis?.start();
    scrollToId(id);
  };

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 h-[2px] bg-smoke"
        style={{ zIndex: "var(--z-nav)" }}
        aria-hidden="true"
      >
        <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-signal" />
      </div>

      <nav
        data-testid="site-nav"
        aria-label="Primary"
        className={`safe-x fixed inset-x-0 top-0 flex h-[68px] items-center justify-between gap-4 transition-colors duration-ui ease-k-out ${
          lifted ? (light ? "bg-[#E8E9E4]/90 backdrop-blur-md" : "bg-carbon/85 backdrop-blur-md") : ""
        }`}
        style={{ zIndex: "var(--z-nav)" }}
      >
        <button
          type="button"
          data-testid="nav-logo"
          aria-label="KymrStudio, back to the top"
          onClick={() => scrollToId("top")}
          className={`inline-flex min-h-[44px] items-center font-cinzel text-base font-bold tracking-tight md:text-lg ${light ? "text-[#14151A]" : "text-frost"}`}
        >
          KymrStudio<span className="text-signal">.</span>
        </button>

        <div className="flex items-center gap-3 md:gap-s5">
          {LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              data-testid={`nav-${l.id}`}
              onClick={() => go(l.id, l.to)}
              className={`hidden min-h-[44px] items-center text-f-sm transition-colors duration-ui ease-k-out md:inline-flex ${light ? "text-[#4C525B] hover:text-[#14151A]" : "text-silver hover:text-frost"}`}
            >
              {l.label}
            </button>
          ))}
          {/* The header CTA is the one flow button that cannot afford
              the component's px-8: the nav bar is 44px tall and the two
              sweeping arrows would cross the label at this width. The
              --tight variant pads it in and drops them, and everything
              else - the fill, the radius change, the timing - is the
              component's. */}
          <FlowButton
            type="button"
            data-testid="nav-start"
            onClick={() => scrollToId("decision")}
            text="Start a Project"
            className={`nav-cta k-flow k-flow--ghost k-flow--tight !min-h-[44px] !text-f-2xs ${light ? "k-flow--light" : ""}`}
          />
          <button
            ref={menuBtnRef}
            type="button"
            data-testid="nav-menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="relative flex h-11 w-11 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span
              aria-hidden="true"
              className={`block h-px w-6 transition-transform duration-ui ease-k-out ${light ? "bg-[#14151A]" : "bg-frost"} ${
                menuOpen ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              aria-hidden="true"
              className={`block h-px w-6 transition-transform duration-ui ease-k-out ${light ? "bg-[#14151A]" : "bg-frost"} ${
                menuOpen ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          id="nav-mobile-menu"
          ref={panelRef}
          data-testid="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="safe-x safe-y fixed inset-0 flex flex-col items-start justify-center gap-2 overscroll-contain bg-carbon md:hidden"
          style={{ zIndex: "var(--z-overlay)" }}
        >
          {MENU_LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              data-testid={`mobile-menu-${l.id}`}
              onClick={() => go(l.id, l.to)}
              className="t-display min-h-[52px] py-1 text-f-2xl text-frost transition-colors duration-ui ease-k-out hover:text-signal"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
